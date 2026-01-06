var fanarts = [];
var page = 1;
var perPage = 9;

firebase.database().ref("fanarts").on("value", function(snapshot){
  fanarts = [];
  snapshot.forEach(function(child){
    fanarts.push(child.val());
  });
  render();
});
