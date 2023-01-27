const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _ = require('lodash');
// const date = require(__dirname + "/date.js");

const app = express();
const port = process.env.PORT || 3000;

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

// sebelum menggunakan database
// const items = ["Buy Food", "Cook Food", "Eat Food"];
// const workItems = [];

// sesudah menggunakan database
// membuat dan menghubungkan db dan nodejs lokal
// mongoose.connect("mongodb://127.0.0.1:27017/todolistBD",
//   { useNewUrlParser: true }
// );

// membuat dan menghubungkan db dan nodejs ke mongo Atlas
mongoose.connect("mongodb+srv://admin-rahmat:Rahmat710@cluster0.j4ztvh0.mongodb.net/todolistBD",
  { useNewUrlParser: true }
);

// membuat schema db
const itemSchema = new mongoose.Schema({
  data: String
});

// membuat "datas" collection db
const Data = mongoose.model('Data', itemSchema);

// menambah data baru ke "datas" collection
const item1 = new Data({
  data: "Selamat Datang"
});

const item2 = new Data({
  data: "Klik + untuk tambah baru"
});

const item3 = new Data({
  data: "<- Klik untuk hapus"
});

// menyimpan data kedalam array default
const defaulItems = [item1, item2, item3];

// membuat schema db
const listSchema = new mongoose.Schema({
  name: String,
  items: [itemSchema]
});

// membuat "datas" collection db
const List = mongoose.model('List', listSchema);


app.get("/", function (req, res) {

  Data.find({}, function (err, dataItems) {
    if (dataItems.length === 0) {
      Data.insertMany(defaulItems, function (err) {
        if (err) {
          console.log(err);
        } else {
          console.log("Berhasil");
        }
      });
      res.redirect('/');
    } else {
      res.render("list", { listTitle: "Today", newListItems: dataItems });
    }
  })

});

app.get("/:costumLink", function (req, res) {
  // const link = req.params.costumLink;
  const link = _.capitalize(req.params.costumLink);

  // console.log(link);

  List.findOne({ name: link }, function (err, foundList) {
    if (!err) {
      if (!foundList) {
        // console.log("Tidak ada");
        const list = new List({
          name: link,
          items: defaulItems
        });
        list.save();
        res.redirect("/" + link);
      } else {
        // console.log("Ada");
        res.render("list", { listTitle: link, newListItems: foundList.items });
      }
    }
  })


})

app.post("/", function (req, res) {

  const item = req.body.newItem;
  const title = req.body.list;
  // console.log(title);

  const inputItem = new Data({
    data: item
  });

  if (title === "Today") {
    inputItem.save();
    res.redirect('/');
  } else {
    List.findOne({ name: title }, function (err, foundList) {
      // console.log(foundList);
      foundList.items.push(inputItem);
      foundList.save();
      res.redirect('/' + title);
    });
  }

});


app.post("/delete", function (req, res) {
  const itemData = req.body.deleteItem;
  const listName = req.body.titleItem;
  // console.log(listName);
  // console.log(itemData);
  // hapus data
  if (listName === "Today") {
    Data.deleteOne({ data: itemData }, function (err) {
      if (err) {
        console.log(err);
      } else {
        res.redirect('/');
      }
    });
  } else {
    List.findOneAndUpdate({ name: listName }, { $pull: { items: { data: itemData } } }, function (err, foundList) {
      if (!err) {
        res.redirect("/" + listName)
      }
    });
  }


});

app.get("/about", function (req, res) {
  res.render("about");
});

app.listen(port, function () {
  console.log("Server started on port 3000");
});
