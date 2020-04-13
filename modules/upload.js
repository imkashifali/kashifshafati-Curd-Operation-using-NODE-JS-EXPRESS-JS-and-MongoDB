const mongoose = require('mongoose');
mongoose.connect('mongodb://localhost:27017/employee', {useNewUrlParser: true, useUnifiedTopology: true});
var conn = mongoose.Collection;


var UploadSchema = new mongoose.Schema({
      imagename: String,
    
  });

   var UploadModel = mongoose.model('uploadImage',UploadSchema);
   module.exports=UploadModel; 
