var express = require('express');
var multer  = require('multer');
var path = require('path');
//Authentication 1
var jwt = require('jsonwebtoken');

var empModel = require('../modules/employee');
var UploadModel = require('../modules/upload');

var router = express.Router();
var employee = empModel.find({});
var imageData = UploadModel.find({});

//Add localstroage Path
//Authentication 2

if (typeof localStorage === "undefined" || localStorage === null) {
    const LocalStorage = require('node-localstorage').LocalStorage;
    localStorage = new LocalStorage('./scratch');
  }


/* Upload image */
///third Step
router.use(express.static(__dirname+"./public/"));
var Storage = multer.diskStorage({
    destination:"./public/upload/",
    filename:(req, file, cb)=>{
        cb(null, file.fieldname+""+Date.now()+path.extname(file.originalname))
    }
}); 
var upload = multer({storage:Storage }).single('file');



///second Step
router.post('/upload/', upload,function(req, res, next) {
    var imageFile =  req.file.filename;
    var success = req.file.filename+ "upload Photo";
    var imageDetail = new UploadModel({
        imagename:imageFile
    });
    imageDetail.save(function(err,doc){
        if(err) throw err;

        imageData.exec(function(err,data){
        if(err) throw err;
        res.render('upload_file',{ title: 'upload file',records:data, success:success});    

        });
    });
});

///first Step
router.get('/upload/', checkLogin,function(req, res, next) {
    imageData.exec(function(err,data){
        if(err) throw err;
        res.render('upload-file',{ title: 'upload-file',success:''});    
    });
}); 
//Authenication Middle Wire
//Authentication 6
function checkLogin(req, res, next){
    var myToken = localStorage.getItem('myToken');
    // invalid token - synchronous
try {
    jwt.verify(myToken, 'loginToken');
  } catch(err) {
    res.send("you need to login access this login ");
  }
  next();
   
}

/*  Login File*/
//Authentication 3
router.get('/login', function(req, res, next) {
    var token = jwt.sign({ foo: 'bar' }, 'loginToken');
    localStorage.setItem('myToken', token);
   res.send("login successfully")
});

/*  LogOut File*/
//Authentication 4
router.get('/logout', function(req, res, next) {
    localStorage.removeItem('myToken');
    res.send("logout successfully")

});







/* GET home page. Route File*/
//Authentication 7
router.get('/',checkLogin,function(req, res, next) {
    employee.exec(function(err,data){
        if(err) throw err;
        res.render('index',{ title: 'Employe Record', records:data , success:''});    

    });
});

//Save Record Query
router.post('/',function(req, res, next){
    var empDetail = new empModel({
        name:req.body.uname,
        email:req.body.email,
        etype:req.body.etype,
        hourlyRate:req.body.hrlyrate,
        totalHour:req.body.totalRate,
        total: parseInt(req.body.hrlyrate) * parseInt(req.body.totalRate)
    });
    empDetail.save(function(err,res1){
        if(err) throw err;
        employee.exec(function(err,data){
            if(err) throw err;
            res.render('index',{title:'Employe Record', records:data, success:"Records insert successfully" });
        });
    });
});

//Search Record Query
router.post('/search/',function(req, res, next){
    var fltname = req.body.fltname;
    var fltemail=req.body.fltemail;
    var fltetype=req.body.fltetype;
    if(fltname !='' && fltemail!='' && fltetype!=''){
        var fltParameter = {$and:[{name:fltname},
            {$and:[{email:fltemail},{etype:fltetype}]}
        ]}
    }
    else if(fltname !='' && fltemail=='' && fltetype!=''){
        var fltParameter={$and:[{name:fltname},{etype:fltetype}]}
    }
    else if(fltname =='' && fltemail!='' && fltetype!=''){
        var fltParameter={$and:[{email:fltemail},{etype:fltetype}]}
    }
    else if(fltname =='' && fltemail=='' && fltetype!=''){
        var fltParameter={etype:fltetype}
    }
    else{
        var fltParameter={}
    }

    var employee = empModel.find(fltParameter);
    employee.exec(function(err,data){
        if(err) throw err;
        res.render('index',{title:'Employe Record', records:data , success:''});
    });
});


//Delete Record Query
router.get('/delete/:id', function(req,res,next){
    var id = req.params.id;
    var dltId = empModel.findByIdAndDelete(id);

    dltId.exec(function(err){
        if(err) throw err;
        employee.exec(function(err,data){
            if(err) throw err;
            res.render('index',{title:'Employe Record', records:data, success:"Records Removed" });
        });
    });
});

//Edit Record Query update

router.get('/edit/:id', function(req, res, next) {
    var id = req.params.id;
    var editId = empModel.findById(id);

    editId.exec(function(err,data){
        if(err) throw err;
        res.render('edit', { title: 'Edit Employe Record', records:data });    

    });
});
//Update Record Query update

router.post('/update/', function(req, res, next) {
    var update = empModel.findByIdAndUpdate(req.body.id,{
        name:req.body.uname,
        email:req.body.email,
        etype:req.body.etype,
        hourlyRate:req.body.hrlyrate,
        totalHour:req.body.totalRate,
        total: parseInt(req.body.hrlyrate) * parseInt(req.body.totalRate)
    });

    update.exec(function(err,data){
        if(err) throw err;
        employee.exec(function(err,data){
            if(err) throw err;
            res.render('index',{title:'Employe Record', records:data, success:"Records Updated successfully" });
        });


    });
});

module.exports = router;
