    const elem = id => document.getElementById(id);
    const txtName = elem("txtName");
    const txtChat = elem("txtChat");
    const btnConnect = elem("btnConnect");
    const btnSend = elem("btnSend");
    var message_side = 'right';
    var Message;
    //const divOut = elem("divOut");
    Message = function (arg,id) {
        this.text = arg.text, this.message_side = arg.message_side;
        this.draw = function (_this) {
            return function () {
                var $message;
                $message = $($('.message_template').clone().html());
                $message.addClass(_this.message_side).find('.text').html(_this.text);
                $message.find('.avatar').html(id.toUpperCase())
                $('.messages').append($message);
                return setTimeout(function () {
                    return $message.addClass('appeared');
                }, 0);
            };
        }(this);
        return this;
    };
    class Chat {
        constructor() {
            this.connecting = false;
            this.connected = false;
            this.name = "";
            this.ws = null;

        }



        dispMessage(text, id, side) {
            var $messages, message;
            if (text.trim() === '') {
                return;
            }
            $('.message_input').val('');
            $messages = $('.messages');

            message_side = side;
            message = new Message({
                text: text,
                message_side: message_side
            }, id);
            message.draw();
            return $messages.animate({
                scrollTop: $messages.prop('scrollHeight')
            }, 300);
        };




        connect() {
            if (this.ws === null) {
                this.connecting = true;
                txtName.disabled = true;
                this.name = txtName.value;
                btnConnect.innerHTML = "Connecting...";
                this.ws = new WebSocket("ws://" + document.location.host + "/chat");
                this.ws.onopen = e => {
                    this.connecting = false;
                    this.connected = true;
                    //divOut.innerHTML = "<p>Connected.</p>";
                    btnConnect.disabled = false;
                    txtChat.disabled = false;
                    btnSend.disabled = false;
                    btnConnect.innerHTML = "Connected"
                    btnConnect.style.backgroundColor = "#a3d063"
                    this.ws.send(this.name + " joined!");
                };
                this.ws.onmessage = e => {
                    // divOut.innerHTML += "<p>" + e.data + "</p>";
                    // divOut.scrollTo(0, divOut.scrollHeight);

                    console.log(e);
                    let msg = String(e.data);
                    let name = msg.substring(0, msg.indexOf(":") - 1);
                    let message_side = 'left';
                    if (name == this.name)
                        message_side = 'right'
                    this.dispMessage(msg.substring(msg.indexOf(":") + 1), name[0], message_side);
                }
                this.ws.onclose = e => {
                    this.disconnect();
                }
            }
        }
        disconnect() {
            if (this.ws !== null) {
                this.ws.send(this.name + " left!");
                this.ws.close();
                this.ws = null;
            }
            if (this.connected) {
                this.connected = false;
                txtChat.disabled = true;
                btnSend.disabled = true;
                txtName.disabled = false;
                //divOut.innerHTML += "<p>Disconnected.</p>";
                btnConnect.innerHTML = "Connect";
            }
        }
        sendMessage(msg) {
            if (this.ws !== null) {
                this.ws.send(this.name + ": " + msg);
            }
        }
    };
    let chat = new Chat();


    chat.dispMessage('Hello Philip! :)', 'T','left');
    setTimeout(function () {
        chat.dispMessage('Hi Sandy! How are you?', 'H', 'right');
    }, 500);
    setTimeout(function () {
        chat.dispMessage('I\'m fine, thank you!', 'T', 'left');
    }, 1000);
    btnConnect.onclick = () => {
        if (chat.connected) {
            chat.disconnect();
        } else if (!chat.connected && !chat.connecting) {
            chat.connect();
        }
    }
    btnSend.onclick = () => {
        chat.sendMessage(txtChat.value);
        txtChat.value = "";
        txtChat.focus();
    }