from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
from datetime import datetime
import os
from dotenv import load_dotenv
from werkzeug.security import generate_password_hash, check_password_hash
import jwt
from functools import wraps

load_dotenv()

app = Flask(__name__)
CORS(app)

# Configuración de la base de datos
app.config['SQLALCHEMY_DATABASE_URI'] = os.getenv('DATABASE_URL')
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['SECRET_KEY'] = os.getenv('SECRET_KEY', 'dev-secret-key')

db = SQLAlchemy(app)

# Modelos
class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    password = db.Column(db.String(120), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

class Sale(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    product_name = db.Column(db.String(100), nullable=False)
    amount = db.Column(db.Float, nullable=False)
    date = db.Column(db.DateTime, nullable=False)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)

# Decorador para proteger rutas
def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = request.headers.get('Authorization')
        
        if not token:
            return jsonify({'message': 'Token faltante'}), 401

        try:
            token = token.split(' ')[1]
            data = jwt.decode(token, app.config['SECRET_KEY'], algorithms=["HS256"])
            current_user = User.query.get(data['user_id'])
        except:
            return jsonify({'message': 'Token inválido'}), 401

        return f(current_user, *args, **kwargs)

    return decorated

# Rutas de autenticación
@app.route('/api/register', methods=['POST'])
def register():
    data = request.get_json()
    
    if User.query.filter_by(username=data['username']).first():
        return jsonify({'message': 'Usuario ya existe'}), 400

    hashed_password = generate_password_hash(data['password'])
    new_user = User(username=data['username'], password=hashed_password)
    
    db.session.add(new_user)
    db.session.commit()
    
    return jsonify({'message': 'Usuario registrado exitosamente'}), 201

@app.route('/api/login', methods=['POST'])
def login():
    data = request.get_json()
    user = User.query.filter_by(username=data['username']).first()
    
    if user and check_password_hash(user.password, data['password']):
        token = jwt.encode({
            'user_id': user.id,
            'exp': datetime.utcnow() + timedelta(days=1)
        }, app.config['SECRET_KEY'])
        
        return jsonify({'token': token})
    
    return jsonify({'message': 'Credenciales inválidas'}), 401

# Rutas CRUD para ventas
@app.route('/api/sales', methods=['GET'])
@token_required
def get_sales(current_user):
    sales = Sale.query.filter_by(user_id=current_user.id).all()
    return jsonify([{
        'id': sale.id,
        'product_name': sale.product_name,
        'amount': sale.amount,
        'date': sale.date.isoformat()
    } for sale in sales])

@app.route('/api/sales', methods=['POST'])
@token_required
def create_sale(current_user):
    data = request.get_json()
    
    new_sale = Sale(
        product_name=data['product_name'],
        amount=data['amount'],
        date=datetime.fromisoformat(data['date']),
        user_id=current_user.id
    )
    
    db.session.add(new_sale)
    db.session.commit()
    
    return jsonify({
        'id': new_sale.id,
        'product_name': new_sale.product_name,
        'amount': new_sale.amount,
        'date': new_sale.date.isoformat()
    }), 201

@app.route('/api/sales/<int:sale_id>', methods=['PUT'])
@token_required
def update_sale(current_user, sale_id):
    sale = Sale.query.filter_by(id=sale_id, user_id=current_user.id).first()
    
    if not sale:
        return jsonify({'message': 'Venta no encontrada'}), 404
        
    data = request.get_json()
    sale.product_name = data.get('product_name', sale.product_name)
    sale.amount = data.get('amount', sale.amount)
    sale.date = datetime.fromisoformat(data.get('date', sale.date.isoformat()))
    
    db.session.commit()
    
    return jsonify({
        'id': sale.id,
        'product_name': sale.product_name,
        'amount': sale.amount,
        'date': sale.date.isoformat()
    })

@app.route('/api/sales/<int:sale_id>', methods=['DELETE'])
@token_required
def delete_sale(current_user, sale_id):
    sale = Sale.query.filter_by(id=sale_id, user_id=current_user.id).first()
    
    if not sale:
        return jsonify({'message': 'Venta no encontrada'}), 404
        
    db.session.delete(sale)
    db.session.commit()
    
    return jsonify({'message': 'Venta eliminada exitosamente'})

if __name__ == '__main__':
    with app.app_context():
        db.create_all()
    app.run(debug=True)