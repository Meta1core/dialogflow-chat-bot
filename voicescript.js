
//Speech to text ------------------------------------------------------------------------------
var SpeechRecognition = window.webkitSpeechRecognition;

var recognition = new webkitSpeechRecognition() || new SpeechRecognition();

var Textbox = $('#m');
var btn = $('#btn');
var instructions = $('instructions');

var Content = '';

recognition.continuous = true;

recognition.onresult = function(event) {

    var current = event.resultIndex;

    var transcript = event.results[current][0].transcript;
    Content += transcript;
    Textbox.val(Content);
    btn.click();
    Content = "";
    recognition.stop();
};

recognition.onstart = function() {
    instructions.text('Voice recognition is ON.');
}

recognition.onerror = function(event) {
    if(event.error == 'no-speech') {
        instructions.text('Try again.');
    }
}
$('#start-btn').on('click', function(e) {
    if (Content.length) {
        Content += ' ';
    }
    recognition.start();
});
//end