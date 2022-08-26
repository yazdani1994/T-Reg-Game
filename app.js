const player = document.getElementById("player");
const player_img = document.getElementById("player-image");
const scoreElem = document.getElementById("score");
const ground = document.getElementById("game-screen");
const sky = document.getElementById("sky");
const street = document.getElementById("street");
const gameOverElem = document.getElementById("gameover-tab");
let ground_interval,
  run_interval,
  jump_interval,
  gravity_interval,
  forward_interval,
  score_interval;
let ground_x = 0,
  player_y = 4,
  player_x = 7;
let ground_speed = 1.1,
  animation_speed = 100,
  jump_speed = 1.5,
  gravity_speed = 1.25,
  player_speed = 0.25;
let is_grounded = true,
  state = "stop",
  time;
let cloud_count = 0,
  cloud_speed = 0.5,
  last_cloud_added = 0,
  time_to_generate_cloud = 3000;
let cactus_count = 0,
  cactus_speed = 1.1,
  last_cactus_added = 0,
  time_to_generate_cactus = 7000;
let score = 0;

document.onkeydown = function (e) {
  let key = e.keyCode;

  if (is_grounded && (key == 32 || key == 38)) {
    jump_interval = setInterval(jump, 1);

    if (state == "stop") state = "start";
  }
};

function scoreing() {
  score += 1;

  let score_string = score.toString().padStart(5, 0);

  scoreElem.innerHTML = score_string;
}

function generate_between(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function ground_move() {
  time = new Date().getTime();

  ground.style.backgroundPositionX = ground_x + "px";
  ground_x -= ground_speed;

  if (last_cloud_added == 0 && cloud_count == 0) {
    last_cloud_added = time;
    last_cactus_added = time;
  }

  if (time > last_cloud_added + time_to_generate_cloud) {
    generate_cloud();

    last_cloud_added = time;
    time_to_generate_cloud = generate_between(1300, 2000);
  }
  if (time > last_cactus_added + time_to_generate_cactus) {
    generate_cactus();

    last_cactus_added = time;
    time_to_generate_cactus = generate_between(700, 2000);
  }

  if (cloud_count != 0) {
    for (let i = 0; i < cloud_count; i++) move_cloud(i);
  }
  if (cactus_count != 0) {
    for (let i = 0; i < cactus_count; i++) move_cactus(i);
  }
}

function running_animation() {
  let player_src = player_img.src.split("/").pop();

  if (player_src == "t%20rex%20left%20foot.png")
    player_img.src = "image/t rex right foot.png";
  else player_img.src = "image/t rex left foot.png";
}

function jump() {
  player_img.src = "image/t rex.png";
  clearInterval(run_interval);

  if (player_y < 100) {
    player.style.bottom = player_y + "px";
    player_y += jump_speed;
    is_grounded = false;
  } else {
    gravity_interval = setInterval(gravity, 1);
    clearInterval(jump_interval);
  }
}

function gravity() {
  if (player_y > 4) {
    player.style.bottom = player_y + "px";
    player_y -= gravity_speed;
  } else {
    clearInterval(gravity_interval);
    is_grounded = true;

    if (state == "start") {
      forward_interval = setInterval(move_forward, 1);
      run_interval = setInterval(running_animation, 80);

      state = "started";
    } else {
      run_interval = setInterval(running_animation, animation_speed);
    }
  }
}

function move_forward() {
  if (player_x < 25) {
    player.style.left = player_x + "px";
    player_x += player_speed;
  } else {
    clearInterval(forward_interval);
    clearInterval(run_interval);
    ground_interval = setInterval(ground_move, ground_speed);
    run_interval = setInterval(running_animation, animation_speed);

    score_interval = setInterval(scoreing, 100);

    state = "play";
  }
}

function generate_cloud() {
  let random_y = generate_between(5, 75);
  let cloud =
    "<img src='image/cloud.png' id='c" +
    cloud_count +
    "' style='position: absolute;right:-50px;top:" +
    random_y +
    "px;'>";

  cloud_count += 1;
  sky.innerHTML += cloud;
}

function move_cloud(nth) {
  let cloud_i = document.getElementById("c" + nth);
  let x_pos = parseFloat(cloud_i.style.right.split("px")[0]);

  if (x_pos < 700) {
    x_pos += cloud_speed;
    cloud_i.style.right = x_pos + "px";
  } else {
    for (let i = nth + 1; i < cloud_count; i++)
      document.getElementById("c" + i).id = "c" + (i - 1);

    cloud_count -= 1;
    cloud_i.remove();
  }
}

function generate_cactus() {
  let random_size = generate_between(20, 28);
  let random_rotation = generate_between(0, 1);

  if (random_rotation == 1) random_rotation = 180;

  let cactus =
    "<img src='image/Cactoos.png' class='cactus' id='t" +
    cactus_count +
    "' style='right:-50px;width:" +
    random_size +
    "px;transform: rotateY(" +
    random_rotation +
    "deg);'>";

  cactus_count += 1;
  street.innerHTML += cactus;
}

function move_cactus(nth) {
  let cactus_i = document.getElementById("t" + nth);
  let x_pos = parseFloat(cactus_i.style.right.split("px")[0]);

  if (x_pos < 700) {
    x_pos += cactus_speed;
    cactus_i.style.right = x_pos + "px";
  } else {
    for (let i = nth + 1; i < cactus_count; i++)
      document.getElementById("t" + i).id = "t" + (i - 1);

    cactus_count -= 1;
    cactus_i.remove();
  }

  if (x_pos > 500) {
    if (is_collide("#player", "#t" + nth)) {
      gameover();
    }
  }
}

function is_collide(main_obj, other_obj) {
  let hit = $(main_obj).collision(other_obj);

  if (hit.length == 0) return false;
  else return true;
}

/*
    اگر می خواین بدون استفاده از پلاگین برخورد رو چک کنید 
    می تونید این تابع رو به جای تابع 
    is_collide
    قرار بدید
    function collisionDetect(obj1, obj2){
        let bound1 = obj1.getBoundingClientRect();
        let bound2 = obj2.getBoundingClientRect();

        return (
            (
                (bound2.x <= bound1.x && bound1.x <= bound2.x + bound2.width) ||
                (bound1.x <= bound2.x && bound2.x <= bound1.x + bound1.width)
            )
            &&
            (
                (bound2.y <= bound1.y && bound1.y <= bound2.y + bound2.height) ||
                (bound1.y <= bound2.y && bound2.y <= bound1.y + bound1.height)
            )
        )
    }
*/

function gameover() {
  player_img.src = "image/t rex game over.png";
  state = "stoped";

  clearInterval(ground_interval);
  clearInterval(run_interval);
  clearInterval(jump_interval);
  clearInterval(gravity_interval);
  clearInterval(score_interval);
  clearInterval(forward_interval);

  gameOverElem.style.display = "block";
}

function reset() {
  state = "stop";
  score = 0;
  scoreElem.innerHTML = "00000";

  sky.innerText = "";
  street.innerText = "";
  gameOverElem.style.display = "none";

  player_img.src = "image/t rex.png";

  player.style.left = "7px";
  player.style.bottom = "4px";

  player_x = 7;
  player_y = 4;
  ground_x = 0;
  is_grounded = true;

  last_cactus_added = 0;
  last_cloud_added = 0;
  time_to_generate_cactus = 7000;
  time_to_generate_cloud = 3000;

  cloud_count = 0;
  cactus_count = 0;

  ground.style.backgroundPositionX = ground_x + "px";
}
