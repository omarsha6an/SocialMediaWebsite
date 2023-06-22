// Global vars
let baseUrl = "https://tarmeezacademy.com/api/v1",
  postContainer = document.getElementById("posts");
const navBtnsLogedout = document.getElementById("nav-btns-logedout");
const navBtnsLogedIn = document.getElementById("nav-btns-logedin");
let currentPage;
let lastPage;

// Login function
function login() {
  axios
    .post(`${baseUrl}/login`, {
      username: `${username.value}`,
      password: `${password.value}`,
    })
    .then(function (response) {
      console.log(response);

      // Save token in localstorage
      localStorage.setItem("token", response.data.token);
      localStorage.setItem("user", JSON.stringify(response.data.user));

      // Close modal
      document.getElementById("login-moda-closer").click();

      // Setup UI for loged in user
      setupUI();

      // show success login alert
      showAlert("Nice, you loged in successfuly!");
    })
    .catch(function (error) {
      console.log(error);

      let errorMsg = error.response.data.message;

      document.getElementById("login-error").textContent = `${errorMsg}
        `;
    });
}

document.getElementById("the-login-btn").addEventListener("click", login);

// Show  notification alert
function showAlert(msg) {
  const alertPlaceholder = document.getElementById("theAlert");
  const appendAlert = (message, type) => {
    const wrapper = document.createElement("div");
    wrapper.innerHTML = [
      `<div class="alert alert-${type} alert-dismissible" role="alert">`,
      `   <div>${message}</div>`,
      '   <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>',
      "</div>",
    ].join("");

    alertPlaceholder.append(wrapper);
  };

  appendAlert(msg, "success");

  // TODO: Hide alert after 3 sec

  // setTimeout(() => {
  //   const alert = bootstrap.Alert.getOrCreateInstance("#theAlert");
  //   alert.close();
  // }, 3000);
}

// Setup UI for loged in user function
function setupUI() {
  const token = localStorage.getItem("token");

  if (token) {
    // Add logout & username & photo in nav
    navBtnsLogedout.style.display = "none";
    navBtnsLogedIn.style.display = "block";

    const userInfo = JSON.parse(localStorage.getItem("user"));
    console.log(userInfo);

    // Add user photo to nav
    const userImage = userInfo.profile_image;
    document
      .querySelector("#nav-btns-logedin img")
      .setAttribute(
        "src",
        userImage.length > 0 ? userImage : "profile-pics/1.png"
      );

    // Add username
    document.querySelector(
      "#nav-btns-logedin b"
    ).innerHTML = `@${userInfo.username}`;

    // Add + sign: posts creater
    if (document.getElementById("add-post") != null) {
      document.getElementById("add-post").style.display = "flex";
    }
  }
}

setupUI();

// Logout function
function logout() {
  localStorage.clear();
  navBtnsLogedIn.style.display = "none";
  navBtnsLogedout.style.display = "block";
  if (document.getElementById("add-post") != null) {
    document.getElementById("add-post").style.display = "none";
  }
  showAlert("You loged out successfuly!");
}

document.getElementById("logout").addEventListener("click", logout);

// Register function
function register() {
  let profilePicInput = profilePic.files[0];
  // TODO: set a defult photo
  let formData = new FormData();

  formData.append("username", regUsername.value);
  formData.append("name", regName.value);
  formData.append("password", regPassword.value);
  formData.append("image", profilePicInput);

  console.log(profilePicInput);

  axios
    .post(`${baseUrl}/register`, formData)
    .then((response) => {
      console.log(response);

      // Save token in localstorage
      localStorage.setItem("token", response.data.token);
      localStorage.setItem("user", JSON.stringify(response.data.user));

      // Close modal
      document.getElementById("register-modal-closer").click();

      // Setup UI for loged in user
      setupUI();

      // show success login alert
      showAlert("You have created the account successfully!");
    })
    .catch(function (error) {
      console.log(error);

      let errorMsg = error.response.data.message;

      document.getElementById("register-error").textContent = `${errorMsg}
      `;
    });
}

document.getElementById("register-btn").addEventListener("click", register);

function checkPostOwner(authorId, postId, postTitle, postBody, postImage) {
  let localedUser = JSON.parse(localStorage.getItem("user"));

  if (localedUser != null) {
    if (localedUser.id == authorId) {
      return `
              <div class="authorOptions">
                <button
                  class="btn btn-success editPostBtn"
                  onclick="openEditPostModal('${postId}','${postTitle}', '${postBody}','${postImage}')"
                  data-bs-toggle="modal"
                  data-bs-target="#editPostModal"
                >
                  Edit
                </button>
                <button class="btn btn-danger">Delete</button>
              </div>
      `;
    } else {
      return ``;
    }
  } else {
    return ``;
  }
}

// Open EditPostModal function
let thePostId;
function openEditPostModal(postId, postTitle, postBody, postImage) {
  console.log(postTitle, postBody, postImage);
  thePostId = postId;

  let editTitle = document.getElementById("edit-title");
  let editBody = document.getElementById("edit-body");

  editTitle.value = postTitle;
  editBody.value = postBody;
}

// Edit post function
function editPost() {
  let editTitle = document.getElementById("edit-title").value;
  let editBody = document.getElementById("edit-body").value;
  let postImage = document.getElementById("edit-image").files[0];

  let formData = new FormData();
  formData.append("title", editTitle);
  formData.append("body", editBody);
  formData.append("_method", "put");

  console.log(editTitle);
  console.log(editBody);
  console.log(thePostId);

  // make edit without imge allowed
  if (postImage != undefined) {
    formData.append("image", postImage);
  }

  let headers = {
    "Content-Type": "multipart/formdata",
    authorization: `Bearer ${localStorage.getItem("token")}`,
  };

  axios
    .post(`${baseUrl}/posts/${thePostId}`, formData, { headers: headers })
    .then((response) => {
      console.log(response);

      document.getElementById("edit-modal-closer").click();

      // show success login alert
      showAlert("Post edited successfully!");

      // Show the new post at the home page after the sendding the post
      if (window.location.pathname == "/postDetails.html") {
        postElement.innerHTML = "";
        getPost();
      } else if (window.location.pathname == "/index.html") {
        postContainer.innerHTML = "";
        getPosts(1);
      }
    })
    .catch((error) => {
      document.getElementById("editpost-error").innerHTML = error.data.message;
    });
}
