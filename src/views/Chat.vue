<template>
  <!-- Incoming Call  -->
  <div class="call" v-if="incomingCall">
    <div class="col-12">
      <!-- <p>Incoming Call From <strong>{{ incomingCaller }}</strong></p> -->
      <p>{{ incomingCallNotification }}</p>
      <div class="btn-group" role="group">
        <button type="button" class="btn btn-danger mx-3" @click="decline()">
          Decline
        </button>
        <router-link
          type="button"
          to="/video"
          class="btn btn-success ml-5"
          @click.native="
            accept();
            channelName();
            createStreams();
          "
        >
          Accept
        </router-link>
      </div>
    </div>
  </div>

  <div class="calling" v-if="isCallingUser">
    <div class="col-12">
      <p>{{ callingUserNotification }}</p>
      <!-- <p>You Are Calling <b>{{ friend }}</b></p> -->
      <button type="button" class="btn btn-danger" @click="cancelCall()">
        Cancel Call
      </button>
    </div>
  </div>
  <!-- End of Incoming Call  -->
  <div class="chattingBody">
    <div class="friend_name">
      <div class="name">
        <h3>{{ friend }}</h3>
      </div>
      <!--music-->
      <div class="music-videoCall">
        <div class="video-icon" @click="sendCall()">
          <font-awesome-icon class="video" icon="fa-solid fa-video" />
          <span :class="onlinestate == 'ONLINE' ? 'connected' : ''"></span>
        </div>

        <div class="music" @click="play()">
          <font-awesome-icon
            v-if="musicOFF == false"
            icon="fa-solid fa-volume-high"
          />
          <font-awesome-icon
            v-if="musicOFF == true"
            icon="fa-solid fa-volume-xmark"
          />
          <audio id="music">
            <source src="../assets/The-Macarons-Project-Fly-Me-To-T.mp3" />
          </audio>
        </div>
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
import { RemoteInvitation } from "agora-rtm-sdk";
import { LocalInvitation } from "agora-rtm-sdk";
//pinia store
import { store } from "../stores/counter";
import { mapState, mapActions } from "pinia";

// appid from agora.io for RTM
const appID = "115d8311e4b84607baade3df97f63e11";
const client = AgoraRTM.createInstance(appID);
export default {
  name: "ChattingBody",
  data: function () {
    return {
      musicOFF: true,
      onlinestate: "",
      //call
      remote: RemoteInvitation,
      local: LocalInvitation,
      incomingCall: false,
      incomingCaller: "",
      incomingCallNotification: "",
      isCallingUser: false,
      callingUserNotification: "",
      //video chat
    };
  },
  computed: {
    ...mapState(store, ["name", "friend"]),
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
      token: "115d8311e4b84607baade3df97f63e11",
    };
    //login
    options.uid = this.name;
    await client.login(options);
    //peer online/offline state
    client.subscribePeersOnlineStatus([this.friend]);
    let thiss = this;
    client.on("PeersOnlineStatusChanged", function (status) {
      let friend = this.friend;
      let peerStatus = Object.values(status).at(`${friend}`);
      thiss.onlinestate = peerStatus;
      console.log(peerStatus);
    });

    //call
    client.on("RemoteInvitationReceived", (data) => {
      this.remote = data;
      this.incomingCall = true;
      this.incomingCaller = data.callerId;
      this.incomingCallNotification = `Incoming Call From ${data.callerId}`;

      data.on("RemoteInvitationCanceled", () => {
        console.log("RemoteInvitationCanceled: ");
        this.incomingCallNotification = "Call has been cancelled";
        setTimeout(() => {
          this.incomingCall = false;
        }, 5000);
      });
      data.on("RemoteInvitationAccepted", (data) => {
        console.log("REMOTE INVITATION ACCEPTED: ", data);
      });
      data.on("RemoteInvitationRefused", (data) => {
        console.log("REMOTE INVITATION REFUSED: ", data);
      });
      data.on("RemoteInvitationFailure", (data) => {
        console.log("REMOTE INVITATION FAILURE: ", data);
      });
    });

    //localInvitation
    let friend = this.friend;
    this.local = client.createLocalInvitation(friend);
    this.local.on("LocalInvitationAccepted", async (invitationData) => {
      console.log("LOCAL INVITATION ACCEPTED: " + invitationData);
      // Join a room using the channel name. The callee will also join the room then accept the call
      this.$router.push("/video");
      this.channelName();
      this.createStreams();
      //   await this.joinRoom(AGORA_APP_ID, data.token, videoChannelName);
      this.isCallingUser = false;
      this.callingUserNotification = "";
    });
    this.local.on("LocalInvitationCanceled", (data) => {
      console.log("LOCAL INVITATION CANCELED: ", data);
      this.callingUserNotification = `${friend} cancelled the call`;
      setTimeout(() => {
        this.isCallingUser = false;
      }, 5000);
    });
    this.local.on("LocalInvitationRefused", (data) => {
      console.log("LOCAL INVITATION REFUSED: ", data);
      this.callingUserNotification = `${friend} refused the call`;
      setTimeout(() => {
        this.isCallingUser = false;
      }, 5000);
    });
    this.local.on("LocalInvitationFailure", (data) => {
      console.log("LOCAL INVITATION FAILURE: ", data);
      this.callingUserNotification = "Call failed. Try Again";
    });
  },
  methods: {
    ...mapActions(store, ["createStreams", "channelName"]),
    //play song
    play() {
      let music = document.getElementById("music");
      if (this.musicOFF) {
        music.play();
        this.musicOFF = false;
      } else {
        music.pause();
        this.musicOFF = true;
      }
    },
    //chat auto scrolling
    scrollToBottom() {
      function gobottom() {
        let chatHistory = document.getElementById("chat");
        chatHistory.scrollTop = chatHistory.scrollHeight;
      }
      setTimeout(gobottom, 500);
    },
    //send
    async send_peer_message() {
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

    //calling
    async sendCall() {
      this.local.send();
      this.isCallingUser = true;
      this.callingUserNotification = `You Are Calling ${this.friend}`;
    },
    accept() {
      this.remote.accept();
    },
    async cancelCall() {
      await this.local.cancel();
      this.isCallingUser = false;
    },
    decline() {
      this.remote.refuse();
      this.incomingCall = false;
    },
  },
};
</script>
<style lang="scss">
.call {
  position: fixed;
  z-index: 6;
  text-align: center;
  background: #315c8ed4;
  padding: 15px;
  width: 100%;
  color: #fff;
}
.calling {
  position: fixed;
  z-index: 6;
  text-align: center;
  background: #315c8ed4;
  padding: 15px;
  width: 100%;
  color: #fff;
}
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
          font-size: 6vw;
          padding: 10px;
        }
      }
    }
    .music-videoCall {
      display: flex;
      flex-direction: row;
      align-items: center;
      margin: 15px;
      cursor: pointer;
      .video-icon {
        display: flex;
        flex-direction: row;
        align-items: center;
        margin-right: 30px;
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
            width: 13px;
            height: 13px;
          }
        }
      }
      svg {
        padding: 5px;
        width: 30px;
        height: 30px;
        @media (max-width: 768px) {
          width: 20px;
          height: 20px;
        }
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
      background-color: rgb(0 0 0 / 63%);
      input {
        width: 70%;
        border-radius: 0;
        outline: 0;
      }
      .sendMessage {
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
