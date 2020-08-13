const express = require('express');
const bodyParser = require('body-parser');
const app = express();
let ObjectId = require('mongodb').ObjectId;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));
app.set('view engine', 'ejs');

const MongoClient = require('mongodb').MongoClient;
const connectionString =
  'mongodb+srv://kalengabret:<password>@cluster0.ff92n.mongodb.net/<dbname>?retryWrites=true&w=majority';

MongoClient.connect(connectionString, { useUnifiedTopology: true }).then(
  (client) => {
    console.log('Connected to Database...');
    const db = client.db('contacts-list');
    const contactsCollection = db.collection('contacts');

    app.post('/contacts', (req, res) => {
      const dataContact = {
        name:
          req.body.name[0].toUpperCase() +
          req.body.name.substring(1).toLowerCase(),
        email: req.body.email.toLowerCase(),
        phone: req.body.phone,
      };
      contactsCollection
        .insertOne(dataContact)
        .then((result) => res.redirect('/'))
        .catch((err) => console.log(err));
    });

    app.get('/', (req, res) => {
      const cursor = db.collection('contacts');
      cursor
        .find()
        .toArray()
        .then((result) => res.render('index.ejs', { contacts: result }))
        .catch((err) => console.log(err));
    });

    app.get('/contacts/update/:id', (req, res) => {
      contactsCollection
        .findOne({ _id: ObjectId(req.params.id) })
        .then((result) => {
          res.render('update.ejs', { contactEdit: result });
        })
        .catch((error) => console.error(error));
    });

    app.post('/contacts/update/:id', (req, res) => {
      contactsCollection
        .updateOne(
          { _id: ObjectId(req.params.id) },
          {
            $set: {
              name: req.body.name,
              phone: req.body.phone,
              email: req.body.email,
            },
          },
          { upsert: true }
        )
        .then((result) => res.redirect('/'))
        .catch((error) => console.error(error));
    });

    app.get('/contacts/delete/:id', (req, res) => {
      contactsCollection
        .deleteOne({ _id: ObjectId(req.params.id) })
        .then((result) => {
          res.redirect('/');
        })
        .catch((error) => console.error(error));
    });
  }
);

app.listen(3030, (req, res) => {
  console.log('Listineng 3030 ...');
});
