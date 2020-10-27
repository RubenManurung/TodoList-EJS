const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));
mongoose.connect("mongodb+srv://admin-ruben:mongodb2020@cluster0.jpgn1.mongodb.net/todoListDB", {
  useNewUrlParser: true,
  useCreateIndex: true,
  useUnifiedTopology: true,
  useFindAndModify: false
});

const activitieSchema = {
  name: String
}

const Activities = new mongoose.model("activitie", activitieSchema);

const activitie1 = new Activities({
  name: "Welcome, to your todoList App."
});

const activitie2 = new Activities({
  name: "Hit the +, add new Activity."
});

const activitie3 = new Activities({
  name: "Check to delete the Activity."
});

const allActivitie = [activitie1, activitie2, activitie3];

const listSchema = {
  name: String,
  items: [activitieSchema]
};

const List = mongoose.model("list", listSchema);

app.get("/", function(req, res){
  // const hari = d1.getDate();
  Activities.find(function(err, docs){
    res.render('list', {
      theDay: "Today",
      activities: docs
    });
  });
});


app.get("/:customName", function(req, res){
  let firtsLeter = req.params.customName.charAt(0).toUpperCase();
  let restLetter = req.params.customName.slice(1, req.params.customName.length).toLowerCase();
  const customListName = firtsLeter+restLetter;

  List.findOne({name: customListName}, function(err, docs){
    if(!err){
      if(!docs){
        //Create a new List
        const list = new List({
          name: customListName,
          items: allActivitie
        });

        list.save();
        res.redirect("/"+customListName);
      }else{
        //Show Existing list
        res.render("list", {
          theDay: docs.name,
          activities: docs.items
        });
      }
    }
  });
});


app.post("/", function(req, res){
  const activityName = req.body.myActivity;
  const listName = req.body.list;

  const input = new Activities({
    name: activityName
  });

  if(listName == "Today"){
    input.save();
    res.redirect("/");
  }else{
    List.findOne({name: listName}, function(err, docs){
      docs.items.push(input);
      docs.save();
      res.redirect("/"+listName);
    });
  }
});


app.post("/delete", function(req, res){
  const checkoutId = req.body.checkbox;
  const listName = req.body.listName;

  if(listName == "Today"){
    Activities.findByIdAndRemove({_id: checkoutId}, function(err){
      if (!err) {
        console.log("Deleted.");
        res.redirect("/")
      }
    });
  }else{
    List.findOneAndUpdate({name: listName}, {$pull: {items: {_id: checkoutId}}}, function(err, docs){
      if(!err){
        res.redirect("/"+listName);
      }
    });
  }
});


app.listen(process.env.PORT || 3000, function(){
  console.log("Server is running in port 3000");
})
