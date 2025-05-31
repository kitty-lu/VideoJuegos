from flask import Flask, request, jsonify
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
from flask_jwt_extended import JWTManager, create_access_token, jwt_required, get_jwt_identity
from datetime import datetime, timedelta
from werkzeug.security import generate_password_hash, check_password_hash
import os
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__)
CORS(app)

# Configuración de la base de datos
app.config['SQLALCHEMY_DATABASE_URI'] = os.getenv('DATABASE_URL')
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['JWT_SECRET_KEY'] = os.getenv('JWT_SECRET_KEY')
app.config['JWT_ACCESS_TOKEN_EXPIRES'] = timedelta(days=1)

db = SQLAlchemy(app)
jwt = JWTManager(app)

# Modelos
class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    password = db.Column(db.String(120), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

class Game(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(200), nullable=False)
    platform = db.Column(db.String(50))
    year = db.Column(db.Integer)
    genre = db.Column(db.String(50))
    publisher = db.Column(db.String(100))
    na_sales = db.Column(db.Float)
    eu_sales = db.Column(db.Float)
    jp_sales = db.Column(db.Float)
    other_sales = db.Column(db.Float)
    global_sales = db.Column(db.Float)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)

# Rutas de autenticación
@app.route('/api/register', methods=['POST'])
def register():
    data = request.get_json()
    
    if User.query.filter_by(username=data['username']).first():
        return jsonify({'error': 'El usuario ya existe'}), 400
        
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
        access_token = create_access_token(identity=user.id)
        return jsonify({'token': access_token}), 200
    
    return jsonify({'error': 'Credenciales inválidas'}), 401

# CRUD de juegos
@app.route('/api/games', methods=['GET'])
@jwt_required()
def get_games():
    user_id = get_jwt_identity()
    games = Game.query.filter_by(user_id=user_id).all()
    
    return jsonify([{
        'id': game.id,
        'name': game.name,
        'platform': game.platform,
        'year': game.year,
        'genre': game.genre,
        'publisher': game.publisher,
        'na_sales': game.na_sales,
        'eu_sales': game.eu_sales,
        'jp_sales': game.jp_sales,
        'other_sales': game.other_sales,
        'global_sales': game.global_sales
    } for game in games]), 200

@app.route('/api/games', methods=['POST'])
@jwt_required()
def create_game():
    user_id = get_jwt_identity()
    data = request.get_json()
    
    new_game = Game(
        name=data['name'],
        platform=data['platform'],
        year=data.get('year'),
        genre=data['genre'],
        publisher=data['publisher'],
        na_sales=data['na_sales'],
        eu_sales=data['eu_sales'],
        jp_sales=data['jp_sales'],
        other_sales=data['other_sales'],
        global_sales=data['global_sales'],
        user_id=user_id
    )
    
    db.session.add(new_game)
    db.session.commit()
    
    return jsonify({
        'id': new_game.id,
        'message': 'Juego creado exitosamente'
    }), 201

@app.route('/api/games/<int:game_id>', methods=['PUT'])
@jwt_required()
def update_game(game_id):
    user_id = get_jwt_identity()
    game = Game.query.filter_by(id=game_id, user_id=user_id).first()
    
    if not game:
        return jsonify({'error': 'Juego no encontrado'}), 404
        
    data = request.get_json()
    
    game.name = data.get('name', game.name)
    game.platform = data.get('platform', game.platform)
    game.year = data.get('year', game.year)
    game.genre = data.get('genre', game.genre)
    game.publisher = data.get('publisher', game.publisher)
    game.na_sales = data.get('na_sales', game.na_sales)
    game.eu_sales = data.get('eu_sales', game.eu_sales)
    game.jp_sales = data.get('jp_sales', game.jp_sales)
    game.other_sales = data.get('other_sales', game.other_sales)
    game.global_sales = data.get('global_sales', game.global_sales)
    
    db.session.commit()
    
    return jsonify({'message': 'Juego actualizado exitosamente'}), 200

@app.route('/api/games/<int:game_id>', methods=['DELETE'])
@jwt_required()
def delete_game(game_id):
    user_id = get_jwt_identity()
    game = Game.query.filter_by(id=game_id, user_id=user_id).first()
    
    if not game:
        return jsonify({'error': 'Juego no encontrado'}), 404
        
    db.session.delete(game)
    db.session.commit()
    
    return jsonify({'message': 'Juego eliminado exitosamente'}), 200

if __name__ == '__main__':
    with app.app_context():
        db.create_all()
    app.run(debug=True)