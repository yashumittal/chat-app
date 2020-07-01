const socket = io();

//Element variables

const $messageForm = document.querySelector("#message-form");
const $messageFormInput = $messageForm.querySelector("input");
const $messageFormButton = $messageForm.querySelector("button");
const $sendLocationButton = document.querySelector("#send-location-button");
const $messages = document.querySelector("#messages");

// Templates

const messageTemplate = document.querySelector("#message-template").innerHTML;
const locationMessageTemplate = document.querySelector("#location-message-template").innerHTML;
const sidebarTemplate = document.querySelector("#sidebar-template").innerHTML;

const { username, room } = Qs.parse(location.search, {
    ignoreQueryPrefix: true,
});

const autoscroll = () => {
    // New message element
    const $newMessage = $messages.lastElementChild

    // Height of the new message
    const newMessageStyles = getComputedStyle($newMessage)
    const newMessageMargin = parseInt(newMessageStyles.marginBottom)
    const newMessageHeight = $newMessage.offsetHeight + newMessageMargin

    // Visible height
    const visibleHeight = $messages.offsetHeight

    // Height of messages container
    const containerHeight = $messages.scrollHeight

    // How far have I scrolled?
    const scrollOffset = $messages.scrollTop + visibleHeight

    if (containerHeight - newMessageHeight <= scrollOffset) {
        $messages.scrollTop = $messages.scrollHeight
    }
}


socket.on("message", (message) => {
    const html = Mustache.render(messageTemplate, {
        username: message.username,
        message: message.text,
        createdAt: moment(message.createdAt).format("hh:mm a"),
    });
    $messages.insertAdjacentHTML("beforeend", html);
    autoscroll()
});

$messageForm.addEventListener("submit", (e) => {
    e.preventDefault();

    // disable
    $messageFormButton.setAttribute("disabled", "disabled");

    const message = $messageFormInput.value;
    socket.emit("sendMessage", { message }, (message) => {
        $messageFormButton.removeAttribute("disabled");
        $messageFormInput.value = "";
        $messageFormInput.focus();
    });
});

$sendLocationButton.addEventListener("click", () => {
    if (!navigator.geolocation) {
        alert("Geo location is not supported in browser");
    }

    $sendLocationButton.setAttribute("disabled", "disabled");

    navigator.geolocation.getCurrentPosition((position) => {
        socket.emit(
            "sendLocation",
            {
                longitude: position.coords.longitude,
                latitude: position.coords.latitude,
            },
            (isLocationSent) => {
                if (isLocationSent) {
                    console.log("Location shared");
                    $sendLocationButton.removeAttribute("disabled");
                }
            }
        );
    });
});

socket.on("locationMessage", (locationMessage) => {
    const html = Mustache.render(locationMessageTemplate, {
        username: locationMessage.username,
        url: locationMessage.url,
        createdAt: moment(locationMessage.createdAt).format("hh:mm a"),
    });
    $messages.insertAdjacentHTML("beforeend", html);
    autoscroll()
});

socket.emit("join", { username, room }, (error) => {
    if (error) {
        location.href = "/";
        alert(error);
    }
})

socket.on("roomData", ({ room, users }) => {
    const html = Mustache.render(sidebarTemplate, {
        room,
        users
    });
    document.querySelector('#sidebar').innerHTML = html
});