const express = require("express");
const app = express();
require("dotenv").config();
const path = require('path');
const bcrypt = require("bcrypt");
const db = require('./db');
const passport = require("passport");
const flash = require('express-flash');
const session = require('express-session');
const methodOverride =  require('method-override');

const initializePassport = require('./passport-config');
const { name } = require("ejs");

initializePassport(
    passport,
    async email => {
        const user = await db.getUserByEmail(email);
        return user[0]; // Ensure you're returning the user object
    },
    async id => {
        const user = await db.getUserById(id);
        return user[0];
    }
    
);

// Set and use
app.set('view engine', 'ejs');
app.use(express.static(path.join(__dirname, "public")));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(flash());
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());
app.use(methodOverride('_method'))

// Rotas get -------------------------------------------------
app.get('/', (req, res) => {
    res.render('home');
});
app.get('/login', checkNotAuthenticated, (req, res) => {
    res.render('login');
});
app.get('/signup', checkNotAuthenticated, (req, res) => {
    res.render('signup');
});
//rota pagina de usuario, com informações do bd
app.get('/user', checkAuthenticated, (req, res) => {
    //renderiz a pagain de usuarios passando os dados nescessarios como argumentos
    res.render('usuario',
        {
            nome: req.user.nome,
            sobrenome: req.user.sobrenome,
        });
});
//rota para as areas salvas
app.get('/area', checkAuthenticated, async (req, res) => {
    const id = req.user.id; 
    const data = await db.getAreaByUserId(id); 
    res.render('area_salva', 
        { 
            nome: req.user.nome, 
            sobrenome: req.user.sobrenome, 
            data, 
            usuario_id: id
        }
    )
})
//rota quem somos
app.get('/quem-somos',(req, res) => {
    res.render('quem-somos');
})
//rota doar
app.get('/doar',(request, response) => {
    response.render('doar');
})
//rota mapa(google maps)
app.get('/maps',(request, response) => {
    response.render('maps');
})
//rota mapa(street maps)
app.get('/street-maps',(request, response) => {
    response.render('street-maps');
})
app.get('/calculadora',(request, response) => {
    response.render('calculadora');
})
// fim rotas get --------------------------------------------

// rotas post --------------------------------------------------
// rota para fazer login, não deixa usuarios logads acessar essa função
app.post('/login', checkNotAuthenticated, passport.authenticate('local', {
    successRedirect: '/user', // em caso de sucesso manda o usuario para a pagina de usuario
    failureRedirect: '/login',// em caso de falha redireciona para login
    failureFlash: true
}));
// rota para mandar os dados do cadastro para o bd não deixa usuarios logads acessar essa função
app.post('/signup', checkNotAuthenticated, async (req, res) => {
    try {
        const hashedPassword = await bcrypt.hash(req.body.senha, 10);
        const data = {
            nome: req.body.nome,
            sobrenome: req.body.sobrenome,
            email: req.body.email,
            senha: hashedPassword,
        };
        await db.insertUsers(data);
        res.redirect('/login');
    } catch {
        res.redirect('/signup');
    }
});

app.post('/salvar-medida', checkAuthenticated, async (req,res) => {
    try{
        const data = {
            largura:req.body.largura,
            comprimento: req.body.comprimento,
            area:req.body.area,
            mantas:req.body.mantas,
            nome_local: req.body.local,
            caixas: req.body.caixas,
            usuario_id: req.user.id
        }
        await db.insertArea(data)
        res.redirect('/area')
    }catch{
        res.redirect('/caculadora')
    }
})
// fim rotas post ---------------------------------------

//faz logout do usuario
app.delete('/logout', (req, res, next) => {
    req.logOut(function(err){
        if (err){
            return next(err)
        }
    })
    res.redirect('/login')
})

//verifica se o usuario esta autenticado 
function checkAuthenticated(req, res, next){
    if (req.isAuthenticated()){
        return next()
    }
    res.redirect('/login')
}
// verifica se não esta autenticado
function checkNotAuthenticated(req, res, next) {
    if (req.isAuthenticated()){
        return res.redirect('/user')
    }
    return next()
}

const port = 3333;
app.listen(port, () => {
    console.log(`Server running on port: ${port}`);
});
