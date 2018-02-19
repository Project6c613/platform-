var user, profilePicture, profileName, profileButton, pictureInProfile, nameInProfile;
var beginButton, correctButton;
var oldScore, newScore;
var signOutButton;
var currentUID;
var nameString;

var config = {
  apiKey: "AIzaSyAtlo66pxNfHMxMVwL7MXNkblK1lanJgk4",
  authDomain: "project6c613.firebaseapp.com",
  databaseURL: "https://project6c613.firebaseio.com",
  projectId: "project6c613",
  storageBucket: "project6c613.appspot.com",
  messagingSenderId: "1082078319138"
};

firebase.initializeApp(config);


function onAuthStateChanged(user) {
  // We ignore token refresh events.
  if (user && currentUID === user.uid) {
    return;
  }

  if (user) {
    currentUID = user.uid;
    console.log(currentUID);
  } else {
    // Set currentUID to null.
    currentUID = null;
    setTimeout(function(){ window.location.href = "index.html"; }, 2000);
  }
}

function addToLeaderboardDatabase() {
  user = firebase.auth().currentUser;
  var users = firebase.database().ref('/users/');
  users.child("participants").once('value', getUserScore);
  function getUserScore(snapshot)
  {
    console.log(snapshot.val());
    snapshot.forEach(userSnapshot => {
       name = userSnapshot.val().username;
       score = userSnapshot.val().userScore;
    });
    var leaderboardData = {
      username: name,
      userScore: score,
    };
  }

  // Write the new post's data simultaneously in the posts list and the user's post list.
  var updates = {};
  updates['/leaderboard/' + user.uid] = leaderboardData;

  return firebase.database().ref().update(updates);

}

/**
 * Starts listening for new posts and populates posts lists.
 */
function startDatabaseQueries() {
  // [START my_top_posts_query]
  var myUserId = firebase.auth().currentUser.uid;
  var topParticipantsRef = firebase.database().ref('/leaderboard/' + myUserId).orderByChild('userScore');
  // [END my_top_posts_query]

  var fetchPosts = function(postsRef, sectionElement) {
    postsRef.on('child_added', function(data) {
      var author = data.val().author || 'Anonymous';
      var containerElement = sectionElement.getElementsByClassName('posts-container')[0];
      containerElement.insertBefore(
          createPostElement(data.key, data.val().title, data.val().body, author, data.val().uid, data.val().authorPic),
          containerElement.firstChild);
    });
    postsRef.on('child_changed', function(data) {
		var containerElement = sectionElement.getElementsByClassName('posts-container')[0];
		var postElement = containerElement.getElementsByClassName('post-' + data.key)[0];
		postElement.getElementsByClassName('mdl-card__title-text')[0].innerText = data.val().title;
		postElement.getElementsByClassName('username')[0].innerText = data.val().author;
		postElement.getElementsByClassName('text')[0].innerText = data.val().body;
		postElement.getElementsByClassName('star-count')[0].innerText = data.val().starCount;
    });
    postsRef.on('child_removed', function(data) {
		var containerElement = sectionElement.getElementsByClassName('posts-container')[0];
		var post = containerElement.getElementsByClassName('post-' + data.key)[0];
	    post.parentElement.removeChild(post);
    });
  };

  // Fetching and displaying all posts of each sections.
  fetchPosts(topUserPostsRef, topUserPostsSection);
  fetchPosts(recentPostsRef, recentPostsSection);
  fetchPosts(userPostsRef, userPostsSection);

  // Keep track of all Firebase refs we are listening to.
  listeningFirebaseRefs.push(topUserPostsRef);
  listeningFirebaseRefs.push(recentPostsRef);
  listeningFirebaseRefs.push(userPostsRef);
}

function updateLeaderboard(){
  //Leaderboard
  var users = firebase.database().ref('/users/');
  users.child("participants").once('value', getUserScore);
  function getUserScore(snapshot)
  {
    console.log(snapshot.val());
    snapshot.forEach(userSnapshot => {
       score = userSnapshot.val().userScore;
    });
    javascript:(function() {
      $axure('@leaderboardrepeater').addRepeaterData([
        {
          username: {type: 'text', text: firebase.auth().currentUser.displayName},
          score: {type: 'text', text: score.toString()},
        }
      ]).refreshRepeater();
    })();
  }
}

function updateUserScore(userscore)
{
  user = firebase.auth().currentUser;
  var users = firebase.database().ref('/users/');
  oldScore, newScore = 0;
  console.log("Participant Data: " + users.child("participants"));
  users.child("participants").once('value', getUserScore);

  function getUserScore(snapshot)
  {
    console.log(snapshot.val());
    snapshot.forEach(userSnapshot => {
       oldScore = userSnapshot.val().userScore;
    });
  console.log(userscore);
  console.log(oldScore);
  console.log(newScore);

  newScore = (oldScore + userscore);
    var userData = {
      username: user.displayName,
      email: user.email,
      profile_picture : user.photoURL,
      participantOrHost: "participant",
      userScore: newScore,
    };

    // Write the new post's data simultaneously in the posts list and the user's post list.
    var updates = {};
    updates['/users/participants/' + user.uid] = userData;

    return firebase.database().ref().update(updates);

    }
};



$(document).ready(function() {
    console.log( "Begin Ready!" );
     beginButton = document.getElementById('u448');
     beginButton.onclick = function () {
        $(document).ready(function() {
          console.log("Competition Ready!");
          profilePicture = document.getElementById('u275_img');
          profilePicture.src = firebase.auth().currentUser.photoURL;
          profileName = document.getElementById('u279');
          profileName.innerHTML = firebase.auth().currentUser.displayName;

          correctButton = document.getElementById('u401');
          correctButton.onclick = function () {
            console.log("Correct Button clicked");
           if($axure.getGlobalVariable('currentDifficulty') == "Easy"){
             console.log("5 points added");
             updateUserScore(5);
             setTimeout(function(){ updateLeaderboard(); }, 5000);
           }
             else if($axure.getGlobalVariable('currentDifficulty') == "Medium"){
              console.log("10 points added");
               updateUserScore(10);
              setTimeout(function(){ updateLeaderboard(); }, 5000);
             }
             else if($axure.getGlobalVariable('currentDifficulty') == "Hard"){
               console.log("20 points added");
               updateUserScore(20);
               setTimeout(function(){ updateLeaderboard(); }, 5000);
             }
           }
           profileButton = document.getElementById('u279');
           profileButton.onclick = function () {
             console.log("Profile Clicked");
             $(document).ready(function() {

               pictureInProfile = document.getElementById('u288_img');
               pictureInProfile.src = firebase.auth().currentUser.photoURL;
               nameInProfile = document.getElementById('u290');
               nameString = firebase.auth().currentUser.displayName;
               nameString = nameString.split(/\s(.+)/)[0];
               nameInProfile.innerHTML = nameString;

               signOutButton = document.getElementById('u302');
               signOutButton.onclick = function() {
                 firebase.auth().signOut();
               }
             });
           }
        });
     }
   firebase.auth().onAuthStateChanged(onAuthStateChanged);
});