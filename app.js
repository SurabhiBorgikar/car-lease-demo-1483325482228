'use strict';
/* global process */
/* global __dirname */
/*eslint-env node*/

/*******************************************************************************
 * Copyright (c) 2015 IBM Corp.
 *
 * All rights reserved.
 *
 *******************************************************************************/
/////////////////////////////////////////
///////////// Setup Node.js /////////////
/////////////////////////////////////////
let express         = require('express');
let session         = require('express-session');
let cookieParser     = require('cookie-parser');
let bodyParser         = require('body-parser');
let app             = express();
let url             = require('url');
let cors             = require('cors');
let fs                 = require('fs');
let tracing = require(__dirname+'/Server_Side/tools/traces/trace.js');

let configFile = require(__dirname+'/Server_Side/configurations/configuration.js');

//Our own modules
let blocks             = require(__dirname+'/Server_Side/blockchain/blocks/blocks.js');
let block             = require(__dirname+'/Server_Side/blockchain/blocks/block/block.js');
let participants     = require(__dirname+'/Server_Side/blockchain/participants/participants.js');
let identity          = require(__dirname+'/Server_Side/admin/identity/identity.js');
let vehicles         = require(__dirname+'/Server_Side/blockchain/assets/vehicles/vehicles.js');
let vehicle          = require(__dirname+'/Server_Side/blockchain/assets/vehicles/vehicle/vehicle.js');
let demo              = require(__dirname+'/Server_Side/admin/demo/demo.js');
let chaincode          = require(__dirname+'/Server_Side/blockchain/chaincode/chaincode.js');
let transactions     = require(__dirname+'/Server_Side/blockchain/transactions/transactions.js');
let startup            = require(__dirname+'/Server_Side/configurations/startup/startup.js');
let http = require('http');

// Object of users' names linked to their security context
let usersToSecurityContext;


////////  Pathing and Module Setup  ////////
app.use(bodyParser.json());
app.use(bodyParser.urlencoded());
app.use(cookieParser());
app.use(session({secret: 'Somethignsomething1234!test', resave: true, saveUninitialized: true}));

// Enable CORS preflight across the board.
app.options('*', cors());
app.use(cors());

app.use(express.static(__dirname + '/Client_Side'));

//===============================================================================================
//    Routing
//===============================================================================================

//-----------------------------------------------------------------------------------------------
//    Admin - Identity
//-----------------------------------------------------------------------------------------------
app.post('/admin/identity', function(req, res, next)     //Sets the session user to have the account address for the page they are currently on
{
    identity.create(req, res, usersToSecurityContext);
});

//-----------------------------------------------------------------------------------------------
//    Admin - Demo
//-----------------------------------------------------------------------------------------------

app.post('/admin/demo', function(req, res, next)
{
    demo.create(req, res, next, usersToSecurityContext);
});

app.get('/admin/demo', function(req, res, next)
{
    demo.read(req, res);
});

//-----------------------------------------------------------------------------------------------
//    Blockchain - chaincode
//-----------------------------------------------------------------------------------------------
app.post('/blockchain/chaincode/vehicles', function(req, res,next){
    chaincode.vehicles.create(req, res,next,usersToSecurityContext);
});

//-----------------------------------------------------------------------------------------------
//    Blockchain - Blocks
//-----------------------------------------------------------------------------------------------
app.get('/blockchain/blocks', function(req, res,next){
    blocks.read(req, res,next,usersToSecurityContext);
});

app.get('/blockchain/blocks/:blockNum(\\d+)', function(req, res, next){
    block.read(req, res, next, usersToSecurityContext);
});

//-----------------------------------------------------------------------------------------------
//    Blockchain - Assets - Vehicles
//-----------------------------------------------------------------------------------------------
app.post('/blockchain/assets/vehicles' , function(req,res,next)
{
    vehicles.create(req,res,next,usersToSecurityContext);
});

app.get('/blockchain/assets/vehicles' , function(req,res, next)
{
    vehicles.read(req,res,next,usersToSecurityContext);
});

//-----------------------------------------------------------------------------------------------
//    Blockchain - Assets - Vehicles - Vehicle
//-----------------------------------------------------------------------------------------------

app.get('/blockchain/assets/vehicles/:v5cID' , function(req,res,next)
{
    vehicle.read(req,res,next,usersToSecurityContext);
});

//-----------------------------------------------------------------------------------------------
//    Blockchain - Assets - Vehicles - Vehicle - Owner
//-----------------------------------------------------------------------------------------------
app.get('/blockchain/assets/vehicles/:v5cID/owner' , function(req,res,next)
{
    vehicle.owner.read(req,res,next,usersToSecurityContext);
});

app.put('/blockchain/assets/vehicles/:v5cID/owner' , function(req,res,next)
{
    vehicle.owner.update(req,res,next,usersToSecurityContext);
});

//-----------------------------------------------------------------------------------------------
//    Blockchain - Assets - Vehicles - Vehicle - VIN
//-----------------------------------------------------------------------------------------------
app.get('/blockchain/assets/vehicles/:v5cID/VIN' , function(req,res,next)
{
    vehicle.VIN.read(req,res,next,usersToSecurityContext);
});

app.put('/blockchain/assets/vehicles/:v5cID/VIN' , function(req,res,next)
{
    vehicle.VIN.update(req,res,next,usersToSecurityContext);
});

//-----------------------------------------------------------------------------------------------
//    Blockchain - Assets - Vehicles - Vehicle - Colour
//-----------------------------------------------------------------------------------------------
app.get('/blockchain/assets/vehicles/:v5cID/colour' , function(req,res,next)
{
    vehicle.colour.read(req,res,next,usersToSecurityContext);
});

app.put('/blockchain/assets/vehicles/:v5cID/colour' , function(req,res,next)
{
    vehicle.colour.update(req,res,next,usersToSecurityContext);
});


//-----------------------------------------------------------------------------------------------
//    Blockchain - Assets - Vehicles - Vehicle - Make
//-----------------------------------------------------------------------------------------------
app.get('/blockchain/assets/vehicles/:v5cID/make' , function(req,res,next)
{
    vehicle.make.read(req,res,next,usersToSecurityContext);
});

app.put('/blockchain/assets/vehicles/:v5cID/make' , function(req,res,next)
{
    vehicle.make.update(req,res,next,usersToSecurityContext);
});

//-----------------------------------------------------------------------------------------------
//    Blockchain - Assets - Vehicles - Vehicle - Model
//-----------------------------------------------------------------------------------------------
app.get('/blockchain/assets/vehicles/:v5cID/model' , function(req,res,next)
{
    vehicle.model.read(req,res,next,usersToSecurityContext);
});

app.put('/blockchain/assets/vehicles/:v5cID/model' , function(req,res,next)
{
    vehicle.model.update(req,res,next,usersToSecurityContext);
});

//-----------------------------------------------------------------------------------------------
//    Blockchain - Assets - Vehicles - Vehicle - Reg
//-----------------------------------------------------------------------------------------------
app.get('/blockchain/assets/vehicles/:v5cID/reg' , function(req,res,next)
{
    vehicle.reg.read(req,res,next,usersToSecurityContext);
});

app.put('/blockchain/assets/vehicles/:v5cID/reg' , function(req,res,next)
{

    vehicle.reg.update(req,res,next,usersToSecurityContext);
});

//-----------------------------------------------------------------------------------------------
//    Blockchain - Assets - Vehicles - Vehicle - Scrapped
//-----------------------------------------------------------------------------------------------
app.delete('/blockchain/assets/vehicles/:v5cID' , function(req,res,next)
{
    vehicle.delete(req,res,next,usersToSecurityContext);
});

app.get('/blockchain/assets/vehicles/:v5cID/scrap' , function(req,res,next)
{
    vehicle.scrapped.read(req,res,next,usersToSecurityContext);
});

//-----------------------------------------------------------------------------------------------
//    Blockchain - Participants
//-----------------------------------------------------------------------------------------------
app.post('/blockchain/participants', function(req,res,next){
    participants.create(req, res,next,usersToSecurityContext);
});

app.get('/blockchain/participants', function(req,res,next){
    participants.read(req,res,next,usersToSecurityContext);
});

app.get('/blockchain/participants/regulators', function(req, res,next){
    participants.regulators.read(req,res,next,usersToSecurityContext);
});

app.get('/blockchain/participants/manufacturers', function(req, res,next){
    participants.manufacturers.read(req,res,next,usersToSecurityContext);
});

app.get('/blockchain/participants/dealerships', function(req, res,next){
    participants.dealerships.read(req,res,next,usersToSecurityContext);
});

app.get('/blockchain/participants/lease_companies', function(req, res,next){
    participants.lease_companies.read(req,res,next,usersToSecurityContext);
});

app.get('/blockchain/participants/leasees', function(req, res,next){
    participants.leasees.read(req,res,next,usersToSecurityContext);
});

app.get('/blockchain/participants/scrap_merchants', function(req, res,next){
    participants.scrap_merchants.read(req,res,next,usersToSecurityContext);
});


//-----------------------------------------------------------------------------------------------
//    Blockchain - Transactions
//-----------------------------------------------------------------------------------------------
app.get('/blockchain/transactions', function(req, res,next){
    transactions.read(req, res,next,usersToSecurityContext);
});

///////////  Configure Webserver  ///////////
app.use(function (req, res, next) {
    let keys;
    console.log('------------------------------------------ incoming request ------------------------------------------');
    console.log('New ' + req.method + ' request for', req.url);
    req.bag = {};                                            //create my object for my stuff
    req.session.count = eval(req.session.count) + 1;
    req.bag.session = req.session;

    let url_parts = url.parse(req.url, true);
    req.parameters = url_parts.query;
    keys = Object.keys(req.parameters);
    if (req.parameters && keys.length > 0) {console.log({parameters: req.parameters});}        //print request parameters
    keys = Object.keys(req.body);
    if (req.body && keys.length > 0) {console.log({body: req.body});}                        //print request body
    next();
});

////////////////////////////////////////////
////////////// Error Handling //////////////
////////////////////////////////////////////
app.use(function (req, res, next) {
    let err = new Error('Not Found');
    err.status = 404;
    next(err);
});

app.use(function (err, req, res, next) {        // = development error handler, print stack trace
    console.log('Error Handler -', req.url, err);
    let errorCode = err.status || 500;
    res.status(errorCode);
    if (req.bag) {
        req.bag.error = {msg: err.stack, status: errorCode};
        if (req.bag.error.status === 404) {
            req.bag.error.msg = 'Sorry, I cannot locate that file';
        }
    }
    //res.render('template/error', {bag: req.bag});
    res.send({'message':err});
});

// Track the application deployments
require('cf-deployment-tracker-client').track();

// ============================================================================================================================
//                                                         Launch Webserver
// ============================================================================================================================
let server = app.listen(8080,'0.0.0.0', function () {
    console.log('------------------------------------------ Server Up - ' + configFile.config.networkProtocol + '://' + configFile.config.app_url + ' ------------------------------------------');
    startup.create()
    .then(function(usersToSC) {
        tracing.create('INFO', 'Startup complete on port', server.address().port);
        usersToSecurityContext = usersToSC;
    });
});
// process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
// process.env.NODE_ENV = 'production';
// process.env.GRPC_SSL_CIPHER_SUITES = 'ECDHE-ECDSA-AES128-GCM-SHA256';

// console.log('ENV VARIABLES', configFile.config.networkProtocol+'://'+configFile.config.api_ip, configFile.config.api_port_external);

if (process.env.VCAP_SERVICES) {
}
