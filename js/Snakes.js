// snake.js

/*** Global Settings ***/

/*** end. Global Settings  ***/

/****************** Utility Classes and Functions ******************/

// global directions enum
const directions = Object.freeze({
  east: 0,
  north: 1,
  west: 2,
  south: 3,
});

// get random integer
function getRandomInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// choose random color
function chooseRandomColor() {
  let r = getRandomInt(0, 255);
  let g = getRandomInt(0, 255);
  let b = getRandomInt(0, 255);
  let rgb = `rgb(${r},${g},${b})`;
  //console.log(rgb);
  return rgb;
}

// pixel class for working with game map
class Pixel {
  constructor(x, y, size, canvas) {
    this.x = x;
    this.y = y;
    this.size = size;
    this.ctx = canvas.getContext("2d");
  }

  // fills pixel with color with transparent border of 1px
  fill() {
    this.ctx.fillRect(this.x + 1, this.y + 1, this.size - 1, this.size - 1);
  }

  // clears pixel
  clear() {
    this.ctx.clearRect(this.x, this.y, this.size, this.size);
  }
}

/****************** Snake Classes ******************/

// X by Y multidimensional array of Pixel Objects
class GameMap {
  constructor(canvas_id, num_rows) {
    // get canvas data
    this.canvas = document.querySelector(canvas_id);
    this.sizing = num_rows;
    this.level = this._tile();
  }

  // creates a sizing by sizing board based on canvas width
  _tile() {
    let pixel_map = [];
    try {
      if (this.canvas.width != this.canvas.height) {
        throw "Squarerror: Map is not square!";
      } else {
        let pixel_size = this.canvas.width / (this.sizing + 1);
        //console.log(pixel_size);
        for (let i = 0; i < this.canvas.width; i = i + pixel_size) {
          let pixel_row = [];
          for (let j = 0; j < this.canvas.width; j = j + pixel_size) {
            pixel_row.push(new Pixel(i, j, pixel_size, this.canvas));
          }
          pixel_map.push(pixel_row);
        }
        return pixel_map;
      }
    } catch (err) {
      alert(err);
    }
  }

  // accepts a list of coordinates to change...
  draw(xy_list) {
    xy_list.forEach((coor) => {
      if (
        !(
          coor[0] < 0 ||
          coor[1] < 0 ||
          coor[0] > this.sizing ||
          coor[1] > this.sizing
        )
      ) {
        this.level[coor[0]][coor[1]].fill();
      }
    });
  }

  // clears the whole map
  clear() {
    let ctx = this.canvas.getContext("2d");
    ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
  }
}

class Snake {
  constructor(sizing, controls) {
    this.sizing = sizing;
    this.direction = getRandomInt(0, 3);
    this.input = this.direction;
    this.body = this._bodyInit(sizing);
    if (controls === undefined) {
      this._setBehavior();
    } else {
      this._setBehavior(controls[0], controls[1], controls[2], controls[3]); //"w", "s", "a", "d"
    }
  }

  // creates a body at a random position of length 3
  _bodyInit(sizing) {
    let body = [];
    let head_x = getRandomInt(4, sizing - 4);
    let head_y = getRandomInt(4, sizing - 4);
    let dir_init = this.direction;

    switch (dir_init) {
      case directions.east:
        for (let i = 0; i < 3; i++) {
          body.push([head_x - i, head_y]);
        }
        break;
      case directions.north:
        for (let i = 0; i < 3; i++) {
          body.push([head_x, head_y + i]);
        }
        break;
      case directions.west:
        for (let i = 0; i < 3; i++) {
          body.push([head_x + i, head_y]);
        }
        break;
      case directions.south:
        for (let i = 0; i < 3; i++) {
          body.push([head_x, head_y - i]);
        }
        break;
    }
    return body;
  }

  // creates eventListeners for the Snake (arrow input)
  _setBehavior(
    upkey = "ArrowUp",
    downkey = "ArrowDown",
    leftkey = "ArrowLeft",
    rightkey = "ArrowRight"
  ) {
    document.addEventListener("keydown", (event) => {
      event.preventDefault();
      switch (event.key) {
        case upkey:
          this.input = directions.north;
          break;
        case downkey:
          this.input = directions.south;
          break;
        case leftkey:
          this.input = directions.west;
          break;
        case rightkey:
          this.input = directions.east;
          break;
      }
    });
  }

  // updates the body of the snake based off direction
  update() {
    let curr_head = this.body[0];
    let new_head = [];
    if (
      this.direction != this.input &&
      this.direction != (this.input + 2) % 4
    ) {
      //console.log(this.direction, this.input);
      this.direction = this.input;
    }
    switch (this.direction) {
      case directions.north:
        new_head = [curr_head[0], curr_head[1] - 1];
        break;
      case directions.east:
        new_head = [curr_head[0] + 1, curr_head[1]];
        break;
      case directions.south:
        new_head = [curr_head[0], curr_head[1] + 1];
        break;
      case directions.west:
        new_head = [curr_head[0] - 1, curr_head[1]];
        break;
    }
    this.body.unshift(new_head);
    this.body.pop();
  }

  // grows the snake
  grow() {
    this.body.unshift([this.body[0][0], this.body[0][1]]);
  }

  // checks to see if snake has eaten Food
  hasEaten(foodPosition) {
    return this.body.some((part) => {
      return foodPosition[0] == part[0] && foodPosition[1] == part[1];
    });
  }

  // checks to see if the snake has collided with self or with wall
  hasCollided(sizing) {
    for (let i = 0; i < this.body.length; i++) {
      // check if any body part is beyond borders
      if (
        this.body[i][0] < 0 ||
        this.body[i][0] > sizing ||
        this.body[i][1] < 0 ||
        this.body[i][1] > sizing
      ) {
        return true;
      }
      if (
        this.body[0][0] == this.body[i][0] &&
        this.body[0][1] == this.body[i][1] &&
        i > 3
      ) {
        return true;
      }
    }
    return false;
  }
}

class Food {
  constructor(sizing) {
    try {
      let pos_x = getRandomInt(0, sizing);
      let pos_y = getRandomInt(0, sizing);
      this.body = [pos_x, pos_y];
    } catch (err) {
      alert("Cannot Construct Food;");
    }
  }
}

class Player {
  constructor(canvasID, size, controls) {
    this.sizing = size - 1;
    this.field = new GameMap("#" + canvasID, this.sizing);
    this.snake = new Snake(this.sizing, controls);
    this.food = new Food(this.sizing);
    this.score = 0;
  }

  checkEvents() {
    if (this.snake.hasEaten(this.food.body)) {
      return "grow";
    }
    if (this.snake.hasCollided(this.sizing)) {
      return "collide";
    }
    return "none";
  }

  levelUp() {
    this.snake.grow();
    this.food = new Food(this.sizing);
    this.score += 1;
  }
}

/****************** Game Glasses ******************/

class Bullet {
  constructor(x, y, dir_init, sizing) {
    this.sizing = sizing;
    this.body = [x, y];
    this.direction = dir_init;
  }

  isOffGrid() {
    if (
      this.body[0] < 0 ||
      this.body[0] > this.sizing ||
      this.body[1] < 0 ||
      this.body[1] > this.sizing
    ) {
      return true;
    } else {
      return false;
    }
  }

  update() {
    switch (this.direction) {
      case directions.north:
        this.body[1] -= 1;
        break;
      case directions.east:
        this.body[0] += 1;
        break;
      case directions.south:
        this.body[1] += 1;
        break;
      case directions.west:
        this.body[0] -= 1;
        break;
    }
  }
}

class ShooterSnake extends Snake {
  constructor(sizing, controls) {
    super(sizing, controls);
  }

  shoot() {
    let check = null;
    for (let i = 0; i < 2; i++) {
      if (this.body.length > 3) {
        check = this.body.pop();
      }
    }
    if (check !== null) {
      return new Bullet(
        this.body[0][0],
        this.body[0][1],
        this.direction,
        this.sizing
      );
    } else {
      return null;
    }
  }

  removeFrom(index) {
    console.log(index, this.body.length);
    index = index === 0 ? 1 : index;
    this.body.splice(index, this.body.length - index);
  }
}

class Competitor extends Player {
  constructor(canvasID, size, playerName, controls, shootkey = " ") {
    super(canvasID, size, controls);
    this.controls = controls;
    this.snake = new ShooterSnake(this.sizing, controls);
    this._setNewBehavior(shootkey);
    this.bullets = Array();
    this.enemybullets = Array();
    this.name = playerName;
  }

  _setNewBehavior(shootkey) {
    document.addEventListener("keydown", (event) => {
      event.preventDefault();
      if (event.key == shootkey) {
        //console.log("shot");
        this.shot = true;
      }
    });
  }

  checkBullets() {
    if (this.shot) {
      let bullet = this.snake.shoot();
      if (bullet !== null) {
        this.bullets.push(bullet);
        this.shot = false;
      }
    }
  }

  isTagged() {
    for (let i = 0; i < this.enemybullets.length; i++) {
      for (let j = 0; j < this.snake.body.length; j++) {
        if (
          this.snake.body[j][0] == this.enemybullets[i].body[0] &&
          this.snake.body[j][1] == this.enemybullets[i].body[1]
        ) {
          this.enemybullets.splice(j, 1);
          return j; // return index of part that got hit
        }
      }
    }
    return -1;
  }

  hasWon(length) {
    return (this.snake.body.length >= length);
  }

  respawn(){
    this.snake = new ShooterSnake(this.sizing, this.controls);
  }
}

class Competition {
  constructor(id1, id2, size) {
    document.body.style.backgroundImage = `linear-gradient(to right,${chooseRandomColor()} , ${chooseRandomColor()})`;
    this.sizing = size - 1;
    this.playerOne = new Competitor(
      id1,
      this.sizing,
      "Player One",
      ["w", "s", "a", "d"],
      "e"
    );
    this.playerTwo = new Competitor(id2, this.sizing, "Player Two");
  }

  run(framerate, winLength) {
    let newCompetition = new Promise((resolve) => {
      console.log("running...");

      let tick = setInterval(() => {
        for (let player of [this.playerOne, this.playerTwo]) {
          player.field.clear();
          player.snake.update();

          // check bullet events
          player.checkBullets();
          player.bullets.forEach((bullet) => {
            bullet.update();
          });

          // check enemy events
          let enemy = this._getOppositeOf(player);
          enemy.bullets.forEach((bullet) => {
            if (bullet.isOffGrid()) {
              //console.log("offgrid");
              switch (bullet.direction) {
                case directions.north:
                  bullet.body[1] += this.sizing;
                  break;
                case directions.east:
                  bullet.body[0] -= this.sizing;
                  break;
                case directions.south:
                  bullet.body[1] -= this.sizing;
                  break;
                case directions.west:
                  bullet.body[0] += this.sizing;
                  break;
              }
              player.enemybullets.push(bullet);
              enemy.bullets.splice(enemy.bullets.indexOf(bullet), 1);
            }
          });

          player.enemybullets.forEach((bullet) => {
            if (bullet.isOffGrid()) {
              player.enemybullets.splice(
                player.enemybullets.indexOf(bullet),
                1
              );
            }
            bullet.update();
          });

          // check player events
          switch (player.checkEvents()) {
            case "grow":
              player.levelUp();
              break;
            case "collide":
              player.respawn();
              break;
          }

          let tagIndex = player.isTagged();
          if (tagIndex != -1) {
            player.snake.removeFrom(tagIndex);
          }

          // draw on field
          player.field.draw(player.snake.body);
          player.field.draw([player.food.body]);
          player.bullets.forEach((bullet) => {
            player.field.draw([bullet.body]);
          });
          player.enemybullets.forEach((bullet) => {
            player.field.draw([bullet.body]);
          });

          // check for win
          if (player.hasWon(winLength)) {
            console.log(player);
            console.log(this._getOppositeOf(player));
            clearInterval(tick);
            resolve(player.name);
          }
        }
      }, framerate);
    });

    // End Game Handling
    newCompetition.then((name) => {
      // print game over message on screen
      alert(name + " has won!");
    });
  }

  _getOppositeOf(player) {
    if (player == this.playerOne) {
      return this.playerTwo;
    } else if (player == this.playerTwo) {
      return this.playerOne;
    } else {
      return "noplayer";
    }
  }

  _updateScore() {}
}

// add game timer
// add score system
// add new colors??
// bullets kill -->
