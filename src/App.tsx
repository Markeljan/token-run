import { useAccount, useConnect, useEnsName, useSigner } from "wagmi";
import { InjectedConnector } from "wagmi/connectors/injected";
import kaboom from "kaboom";
import { useEffect, useRef, useState } from "react";
import { ethers } from "ethers";
import { CONTRAACT_ABI, CONTRACT_ADDRESS } from "./Solidity/ContractData";
import { useNetwork } from "wagmi";

function App() {
  const { address, isConnected } = useAccount();
  const { data: ensName } = useEnsName({ address });
  const { connect } = useConnect({
    connector: new InjectedConnector(),
  });
  const { data: signer, isError, isLoading } = useSigner();
  const [gameOver, setGameOver] = useState(false);
  const [score, setScore] = useState(0);
  const canvasRef = useRef(null);
  const { chain, chains } = useNetwork()

  useEffect(() => {
    console.log("chainId: ", chain?.id);
    if (chain?.id && chain.id !== 137 && gameOver) {
      alert("Please switch to Polygon Network");
    }
  }, [chain, gameOver]);

  useEffect(() => {
    const k = kaboom({
      global: true,
      canvas: canvasRef.current as any,
      scale: 2,
      height: 280,
      width: 280,
    });

    const {
      addLevel,
      area,
      destroy,
      get,
      layers,
      loadSprite,
      pos,
      rand,
      shake,
      sprite,
      text,
      vec2,
      wait,
    } = k;

    loadSprite("background", "sprites/background.png");
    loadSprite("fence-top", "sprites/fence-top.png");
    loadSprite("fence-bottom", "sprites/fence-bottom.png");
    loadSprite("fence-left", "sprites/fence-left.png");
    loadSprite("fence-right", "sprites/fence-right.png");
    loadSprite("post-top-left", "sprites/post-top-left.png");
    loadSprite("post-top-right", "sprites/post-top-right.png");
    loadSprite("post-bottom-left", "sprites/post-bottom-left.png");
    loadSprite("post-bottom-right", "sprites/post-bottom-right.png");
    loadSprite("snake-skin", "sprites/shiba.png");
    loadSprite("pizza", "sprites/eth.png");

    layers(["background", "game"], "game");

    add([sprite("background"), layer("background")]);

    const directions = {
      UP: "up",
      DOWN: "down",
      LEFT: "left",
      RIGHT: "right",
    };

    let current_direction = directions.RIGHT;
    let run_action = false;
    let snake_length = 3;
    let snake_body: any[] = [];

    const block_size = 20;

    const map = addLevel(
      [
        "1tttttttttttt2",
        "l            r ",
        "l            r ",
        "l            r ",
        "l            r ",
        "l            r ",
        "l            r ",
        "l            r ",
        "l            r ",
        "l            r ",
        "l            r ",
        "l            r ",
        "l            r ",
        "3bbbbbbbbbbbb4",
      ],
      {
        width: block_size,
        height: block_size,
        pos: vec2(0, 0),
        t: () => [sprite("fence-top"), area(), "wall"],
        b: () => [sprite("fence-bottom"), area(), "wall"],
        l: () => [sprite("fence-left"), area(), "wall"],
        r: () => [sprite("fence-right"), area(), "wall"],
        "1": () => [sprite("post-top-left"), area(), "wall"],
        "2": () => [sprite("post-top-right"), area(), "wall"],
        "3": () => [sprite("post-bottom-left"), area(), "wall"],
        "4": () => [sprite("post-bottom-right"), area(), "wall"],
      } as any
    );

    let score = 0;

    const scoreLabel = add([
      text("Score: 0"),
      scale(0.5),
      pos(20, 20),
      layer("game"),
      {
        value: score,
      },
    ]);

    collides("snake", "food", (s, f) => {
      snake_length++;
      score += 10;
      setScore(score);
      scoreLabel.text = `Score: ${score}`;
      respawn_food();
    });

    function respawn_snake() {
      snake_body.forEach((segment) => {
        destroy(segment);
      });
      snake_body = [];
      snake_length = 3;

      for (let i = 1; i <= snake_length; i++) {
        snake_body.push(
          add([sprite("snake-skin"), pos(block_size, block_size * i), area(), "snake"])
        );
      }
      current_direction = directions.RIGHT;
    }

    let food: any = null;

    function respawn_food() {
      let new_pos = rand(vec2(1, 1), vec2(13, 13));
      new_pos.x = Math.floor(new_pos.x);
      new_pos.y = Math.floor(new_pos.y);
      new_pos = new_pos.scale(block_size);

      if (food) {
        destroy(food);
      }
      food = add([sprite("pizza"), pos(new_pos), area(), "food"]);
    }

    function respawn_all() {
      run_action = false;
      wait(0.5, function () {
        respawn_snake();
        respawn_food();
        run_action = true;
      });
    }

    respawn_all();

    collides("snake", "wall", (s, w) => {
      run_action = false;
      shake(12);
      respawn_all();
      setGameOver(true);
    });

    collides("snake", "snake", (s, t) => {
      run_action = false;
      shake(12);
      respawn_all();
      setGameOver(true);
    });

    k.keyPress("up", () => {
      if (current_direction != directions.DOWN) {
        current_direction = directions.UP;
      }
    });

    k.keyPress("down", () => {
      if (current_direction != directions.UP) {
        current_direction = directions.DOWN;
      }
    });

    k.keyPress("left", () => {
      if (current_direction != directions.RIGHT) {
        current_direction = directions.LEFT;
      }
    });

    k.keyPress("right", () => {
      if (current_direction != directions.LEFT) {
        current_direction = directions.RIGHT;
      }
    });

    let move_delay = 0.2;
    let timer = 0;
    k.action(() => {
      if (!run_action) return;
      timer += dt();
      if (timer < move_delay) return;
      timer = 0;

      let move_x = 0;
      let move_y = 0;

      switch (current_direction) {
        case directions.DOWN:
          move_x = 0;
          move_y = block_size;
          break;
        case directions.UP:
          move_x = 0;
          move_y = -1 * block_size;
          break;
        case directions.LEFT:
          move_x = -1 * block_size;
          move_y = 0;
          break;
        case directions.RIGHT:
          move_x = block_size;
          move_y = 0;
          break;
      }

      // Get the last element (the snake head)
      let snake_head = snake_body[snake_body.length - 1];

      snake_body.push(
        k.add([
          k.sprite("snake-skin"),
          k.pos(snake_head.pos.x + move_x, snake_head.pos.y + move_y),
          k.area(),
          "snake",
        ])
      );

      if (snake_body.length > snake_length) {
        let tail = snake_body.shift(); // Remove the last of the tail
        k.destroy(tail);
      }
    });
  }, []);

  async function handleMintTokens() {
    if (!isConnected || !signer) {
      alert("Please connect your wallet first!");
      return;
    }
    const CONTRACT_WRITE = new ethers.Contract(CONTRACT_ADDRESS, CONTRAACT_ABI, signer);

    const mintTX = await CONTRACT_WRITE.mintTokens(score)
      .then((response: any) => {
        console.log("Minted tokens:", response);
      })
      .catch((error: any) => {
        console.error("Error minting tokens:", error);
      });

    // alert("Minted " + amountToMint + " tokens!"  + " Transaction Hash: " + mintTX.hash);
    setScore(0);
  }

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        flexDirection: "column",
        justifyContent: "center",
        height: "100vh",
      }}
    >
      {!gameOver ? (
        <>
          {isConnected ? (
            <div>Connected to {ensName ?? address}</div>
          ) : (
            <button onClick={() => connect()}>Connect Wallet</button>
          )}
          <canvas
            ref={canvasRef}
            style={{
              display: "block",
              margin: "0 auto",
            }}
          ></canvas>
        </>
      ) : (
        <div
          style={{
            color: "#f0f0f0",
            fontSize: "1.5rem",
            marginBottom: "1rem",
          }}
        >
          <div>Game Over</div>
          <div>Your score: {score}</div>
          <button
            onClick={() => handleMintTokens()}
            style={{
              backgroundColor: "#4caf50", // Button background color
              border: "none", // No border
              color: "white", // Button text color
              padding: "10px 20px", // Button padding (top/bottom and left/right)
              textAlign: "center", // Center the text inside the button
              textDecoration: "none", // No underline for the text
              display: "inline-block", // Display as an inline block
              fontSize: "16px", // Button text size
              margin: "4px 2px", // Button margin (top/bottom and left/right)
              cursor: "pointer", // Button cursor (hand icon)
              borderRadius: "8px", // Button border-radius (rounded corners)
              boxShadow: "0 2px 5px rgba(0, 0, 0, 0.25)", // Box shadow (adds depth)
              transition: "all 0.3s", // Transition for hover effect
            }}
          >
            Mint {score} RUN tokens
          </button>
        </div>
      )}
    </div>
  );
}

export default App;
