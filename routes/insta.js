const express = require("express");
const router = express.Router();
const { IgApiClient } = require("instagram-private-api");
const { v4: uuidv4 } = require("uuid");
const ig = new IgApiClient();
const instaClientArray = [];

// Create a new device
function createNewDevice(username) {
  device.state.generateDevice(username);
  return device;
}

// Log in
async function login(username, password) {
  const device = createNewDevice(username);
  await device.account.login(username, password);
}

// USER LOGIN
router.post("/login", async (req, res) => {
  try {
    console.log("reqqqqq", req.body);
    const { username, password } = req.body;
    const uuid = uuidv4();
    const device = new IgApiClient();
    device.state.generateDevice(username);
    await device.account.login(username, password);
    console.log("Logged in successfully.", uuid);
    instaClientArray.push({ uuid: uuid, igClient: device });
    return res.json({
      status: true,
      message: "Logged in successfully.",
      uuid,
    });
  } catch (error) {
    res.status(500).send("Login failed: " + error);
  }
});

router.get("/getProfile/:uuid", async (req, res) => {
  try {
    const device = instaClientArray.filter((f) => f.uuid === req.params.uuid);
    const loggedInUser = await instaClientArray[0].user.info(
      await instaClientArray[0].user.getIdByUsername(req.body.username)
    );

    const timelineFeed = instaClientArray[0].feed.user(loggedInUser.pk);
    const account = await instaClientArray[0].account.currentUser();
    const posts = await timelineFeed.items();

    // Fetch followers
    const followersFeed =
      instaClientArray[0].feed.accountFollowers(loggedInUser);
    const followers = await followersFeed.items();

    // Fetch following
    const followingFeed =
      instaClientArray[0].feed.accountFollowing(loggedInUser);
    const following = await followingFeed.items();

    return res.json({
      status: true,
      account,
      posts,
      followers,
      following,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch posts" });
  }
});

//get story
router.get("/story/:uuid", async (req, res) => {
  try {
    const device = instaClientArray.filter((f) => f.uuid === req.params.uuid);
    const followingFeed = instaClientArray[0].igClient.feed.accountFollowing(
      instaClientArray[0].igClient.state.cookieUserId
    );
    // Fetch the list of followings
    const followings = await followingFeed.items();
    const storyArray = [];
    // Loop through followings and get their stories
    for (const following of followings) {
      try {
        const userFeed = instaClientArray[0].igClient.feed.userStory(
          following.pk
        );
        const stories = await userFeed.items();
        storyArray.push({
          user: {
            username: following.username,
            profile_pic_url: following.profile_pic_url,
            full_name: following.full_name,
          },
          story: stories,
        });
        console.log(`Stories of ${following.username}:`);
      } catch (error) {
        console.error(
          `Error fetching stories for ${following.username}:`,
          error
        );
      }
    }
    return res.json({
      status: true,
      storyArray,
    });
  } catch (error) {
    console.error("story get failed:", error);
  }
});

// // Function to get followings' stories
async function getFollowingsStories() {
  const followingFeed = device.feed.accountFollowing(device.state.cookieUserId);

  // Fetch the list of followings
  const followings = await followingFeed.items();

  // Loop through followings and get their stories
  for (const following of followings) {
    try {
      const userFeed = device.feed.userStory(following.pk);
      const stories = await userFeed.items();
      console.log(`Stories of ${following.username}:`, stories);
    } catch (error) {
      console.error(`Error fetching stories for ${following.username}:`, error);
    }
  }
}

//get oneUserStory
router.get("/oneUserStory/:uuid", async (req, res) => {
  try {
    const { username } = req.body;
    console.log("username",username);
    const device = instaClientArray.filter((f) => f.uuid === req.params.uuid);

    if (device.length === 0) {
      return res.json({
        status: false,
        message: "Device not found",
      });
    }

    const user = await ig.user.searchExact(username);
    const userId = user.pk;

    // Fetch the user's stories
    const userFeed = ig.feed.userStory(userId);
    const stories = await userFeed.items();

    console.log(`Stories of ${username}:`, stories);

    return res.json({
      status: true,
      stories,
    });
  } catch (error) {
    console.error("oneUserStory get failed:", error);
  }
});

//get All Following
router.get("/allFollowing/:uuid", async (req, res) => {
  try {
    const cl = instaClientArray.filter((f) => f.uuid === req.params.uuid);
    console.log("cl.igClientcl.igClientcl.igClientcl.igClient===>>>", cl);
    const followingFeed = await cl[0].igClient.feed.accountFollowing(
      cl[0].igClient.state.cookieUserId
    );
    // Fetch the list of followings
    const followings = await followingFeed.items();

    return res.json({
      status: true,
      followings,
    });
  } catch (error) {
    console.error("allFollowing get failed:", error);
  }
});

//get profile
router.get("/getProfile/:uuid", async (req, res) => {
  try {
    const device = instaClientArray.filter((f) => f.uuid === req.params.uuid);

    if (device.length === 0) {
      return res.json({
        status: false,
        message: "Device not found",
      });
    }
    const { username } = req.body;
    device[0].state.generateDevice(username);
    await device[0].simulate.preLoginFlow();

    // Search for users by username
    const searchResult = await device[0].user.searchExact(username);
    console.log("Search Result:", searchResult);

    if (searchResult) {
      // Retrieve the user ID and fetch user data
      const userId = searchResult.pk;
      const userInfo = await device[0].user.info(userId);
      console.log("User Info:", userInfo);
      return res.json({
        status: true,
        userInfo,
      });
    } else {
      console.log("User not found");
      return res.json({
        status: false,
        message: "User not found",
      });
    }
  } catch (error) {
    console.error("profile get failed:", error);
  }
});

module.exports = router;
