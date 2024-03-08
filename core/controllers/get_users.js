module.exports = {
  getUsers: function (app, db) {

    app.get('/getUsers', (req, res) => {
      const sqlQuery = "SELECT * FROM Registered_Users";

      db.query(sqlQuery, (err, results) => {
        if (err) {
          console.error(err);
          res.status(500).send('Failed to retrieve users from the database.');
          return;
        }
        res.status(200).json(results);
      });
    });
  }
};