<template>
  <div class="chattingBody">
    <div class="friend_name">
      <div class="name">
        <h3>{{ friend }}</h3>
        <span :class="online == true ? 'connected' : ''"></span>
      </div>
      <!--music-->
      <div class="music" @click="play()">
        <font-awesome-icon icon="fa-solid fa-music" />
        <span id="musicText"> Music?</span>
        <audio id="music">
          <source src="../assets/The-Macarons-Project-Fly-Me-To-T.mp3" />
        </audio>
      </div>
    </div>
    <div id="chat" class="chat">
      <div class="person">
        <div id="log" class="log">
          <div class="message__chat">
            <div class="message__outer">
              <div class="message__avatar"></div>
              <div id="message__inner" class="message__inner">
                <div class="message__actions">
                  <ul class="menu"></ul>
                </div>
                <div class="message__spacer"></div>
              </div>
              <div class="message__status">
                <span class="avatar"></span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div class="input-field channel-padding">
      <form action>
        <input
          class="message"
          type="text"
          placeholder="peer message"
          id="peerMessage"
          autocomplete="off"
          @focusin="scrollToBottom()"
        />
        <button
          class="sendMessage btn btn-success"
          @click="
            send_peer_message();
            clearValue();
            scrollToBottom();
          "
          type="button"
          id="send_peer_message"
        >
          <b>Send </b>
          <font-awesome-icon icon="fa-solid fa-paper-plane" />
        </button>
      </form>
    </div>
  </div>
</template>
<script>
import AgoraRTM from "agora-rtm-sdk";
import { nameStore } from "../stores/counter";
import { mapState } from "pinia";
// appid from agora.io
const appID = "d460c130220e4941a265909240fe0088";
const client = AgoraRTM.createInstance(appID);

export default {
  name: "ChattingBody",
  data: function () {
    return {
      channel: "main",
      musicOFF: true,
      online: {},
      timer: null,
    };
  },
  computed: {
    ...mapState(nameStore, ["name", "friend"]),
  },
  async mounted() {
    // Display Message From Peer
    client.on("MessageFromPeer", function (message) {
      let str = JSON.stringify(message.text);
      let hismessages = document.createElement("div");
      document
        .getElementById("message__inner")
        .appendChild(hismessages)
        .append(str.substr(1, str.length - 2));
      hismessages.setAttribute("class", "message__bubble hismessages");
    });
    // Display connection state changes
    client.on("ConnectionStateChanged", function (state, reason) {
      console.log("State changed To: " + state + " Reason: " + reason);
    });
    // Get the input field
    let input = document.getElementById("peerMessage");

    // Execute a function when the user presses a key on the keyboard
    input.addEventListener("keypress", function (event) {
      // If the user presses the "Enter" key on the keyboard
      if (event.key === "Enter") {
        // Cancel the default action, if needed
        event.preventDefault();
        // Trigger the button element with a click
        document.getElementById("send_peer_message").click();
      }
    });
    let options = {
      uid: "",
      token: "d460c130220e4941a265909240fe0088",
    };
    //login
    options.uid = this.name;
    await client.login(options);
    //peer online/offline state
    let thiss = this;
    let friend = this.friend;
    this.timer = setInterval(() => {
      client.queryPeersOnlineStatus([friend]).then(
        function (value) {
          let peerStatus = Object.values(value).at(`${friend}`);
          thiss.online = peerStatus;
          console.log(peerStatus);
        },
        function (error) {
          console.log(error);
        }
      );
    }, 3000);
  },
  beforeDestroy() {
    clearInterval(this.timer);
  },
  methods: {
    //play song
    play: function () {
      let music = document.getElementById("music");
      let musicText = document.getElementById("musicText");
      if (this.musicOFF) {
        music.play();
        musicText.innerText = " Enjoy :>";
        this.musicOFF = false;
      } else {
        music.pause();
        musicText.innerText = " okay :<";
        this.musicOFF = true;
      }
    },
    //chat auto scrolling
    scrollToBottom: function () {
      function gobottom() {
        let chatHistory = document.getElementById("chat");
        chatHistory.scrollTop = chatHistory.scrollHeight;
      }
      setTimeout(gobottom, 500);
    },
    //send
    send_peer_message: async function () {
      //the 3 main variables
      let peerId = this.friend;
      let peerMessage = document.getElementById("peerMessage").value.toString();
      //  let userID = document.getElementById("userID").value.toString();
      await client
        .sendMessageToPeer({ text: peerMessage }, peerId)
        .then((sendResult) => {
          if (sendResult.hasPeerReceived) {
            let message = document.createElement("div");
            document
              .getElementById("message__inner")
              .appendChild(message)
              .append(peerMessage);
            message.setAttribute("class", "message__bubble mymessages");
          } else {
            let message = document.createElement("div");
            document
              .getElementById("message__inner")
              .appendChild(message)
              .append(peerMessage);
            message.setAttribute("class", "message__bubble mymessages");
          }
        });
    },
    clearValue: function () {
      document.getElementById("peerMessage").value = "";
    },
  },
};
</script>
<style lang="scss">
.chattingBody {
  position: relative;
  width: 100%;
  .friend_name {
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
    color: #fff;
    height: 15vh;
    background-color: #000;
    .name {
      display: flex;
      align-items: center;
      h3 {
        margin: 0;
        padding: 15px;
        font-size: 4vw;
        @media (max-width: 991px) {
          font-size: 8vw;
        }
      }
      span {
        display: block;
        width: 25px;
        height: 25px;
        border-radius: 50%;
        background-color: rgb(92, 92, 92);
        &.connected {
          background-color: green;
        }
        @media (max-width: 768px) {
          width: 15px;
          height: 15px;
        }
      }
    }
    .music {
      margin: 20px;
      font-size: 2vw;
      font-weight: bold;
      font-family: monospace;
      cursor: pointer;
      animation: light 2s infinite;
      @keyframes light {
        0% {
          color: #7970e2;
        }
        50% {
          color: #fff;
        }
        100% {
          color: #7970e2;
        }
      }
      @media (max-width: 991px) {
        font-size: 6vw;
      }
    }
  }
  .chat {
    width: 100%;
    height: 75vh;
    overflow-y: scroll;
    margin: auto;
    background-color: rgb(0 0 0 / 63%);
    border-bottom: 1px solid #fff;
    border-top: 1px solid #fff;
    /* Scrollbar Styling */
    &::-webkit-scrollbar {
      width: 8px;
      opacity: 0.9;
    }
    &::-webkit-scrollbar-track {
      background-color: #28304666;
    }
    &::-webkit-scrollbar-thumb {
      -webkit-border-radius: 15px;
      border-radius: 15px;
      background: #283046;
    }
    .log {
      color: #fff;
      width: 90%;
      margin: auto;
      .message__chat {
        .message__outer {
          display: flex;
          .message__avatar {
            padding-left: 6px;
            padding-right: 8px;
            img {
              width: 16px;
            }
          }
          .message__status {
            width: 20px;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: flex-end;
          }
          .message__inner {
            flex: 1;
            display: flex;
            flex-direction: row-reverse;
            display: flex;
            flex-flow: column wrap;
            .message__actions {
              width: 67px;
              padding-right: 5px;
              flex-shrink: 0;
              display: flex;
              flex-direction: column;
              justify-content: center;
              align-items: center;
            }
            .message__spacer {
              flex: 1;
            }
            .message__bubble {
              max-width: calc(100% - 67px);
              overflow-wrap: break-word;
              text-overflow: ellipsis;
              max-width: 200px;
              &.mymessages {
                align-self: flex-start;
                width: fit-content;
                background-color: #565288;
                margin: 10px 0;
                padding: 12px;
                border-bottom-right-radius: 16px;
                border-top-right-radius: 16px;
                border-top-left-radius: 16px;
              }
              &.hismessages {
                align-self: flex-end;
                width: fit-content;
                background-color: #565288;
                margin: 10px 0;
                padding: 12px;
                border-bottom-left-radius: 16px;
                border-top-right-radius: 16px;
                border-top-left-radius: 16px;
              }
              /* First message */
              &.message--first {
                border-end-end-radius: 4px;
              }
              /* Middle message */
              &.message--middle {
                border-start-end-radius: 4px;
                border-end-end-radius: 4px;
              }
              /* Last message */
              &.message--last {
                border-start-end-radius: 4px;
              }
            }
          }
        }
      }
    }
  }
  .message {
    padding: 8px;
    border-radius: 0.25rem;
  }
  .input-field {
    height: 10vh;
    width: 100%;
    text-align: center;
    form {
      height: 100%;
      background-color: rgb(0 0 0 / 63%);
      input {
        height: 80%;
        width: 70%;
        border-radius: 0;
        outline: 0;
      }
      .sendMessage {
        height: 80%;
        width: 10%;
        padding: 8px;
        background: #000000cc;
        color: #fff;
        border: 1px solid #fff;
        &:hover {
          color: #000;
          background-color: #fff;
        }
        @media (max-width: 768px) {
          width: 30%;
        }
      }
    }
  }
}
</style>
