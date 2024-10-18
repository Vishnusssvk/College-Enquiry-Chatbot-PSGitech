import speech_recognition as sr
import requests
import json

# Initialize the speech recognizer
recognizer = sr.Recognizer()

# Rasa REST API endpoint
RASA_ENDPOINT = "http://localhost:5005/webhooks/rest/webhook"

def send_message_to_rasa(message):
    """Send user input (text) to Rasa chatbot and print the bot's response."""
    payload = {"sender": "user", "message": message}
    try:
        response = requests.post(RASA_ENDPOINT, json=payload)
        bot_responses = response.json()

        for bot_response in bot_responses:
            print(f"Bot: {bot_response.get('text', 'No response from bot!')}")
    except Exception as e:
        print(f"Error communicating with Rasa server: {str(e)}")

def get_keyboard_input():
    """Get text input from the keyboard."""
    return input("You (Keyboard): ")

def get_speech_input():
    """Get speech input from the user and convert it to text."""
    with sr.Microphone() as source:
        print("Listening... (Speak now)")
        recognizer.adjust_for_ambient_noise(source, duration=0.5)
        audio = recognizer.listen(source)

        try:
            text = recognizer.recognize_google(audio)
            print(f"You (Speech): {text}")
            return text.lower()
        except sr.UnknownValueError:
            print("Sorry, I could not understand the audio.")
            return None

if __name__ == "__main__":
    print("Welcome! Type 'quit' to exit.")
    while True:
        try:
            # Choose between keyboard or speech input
            input_type = input("Enter 'k' for keyboard input or 's' for speech input: ").strip().lower()

            if input_type == 'k':
                user_message = get_keyboard_input().strip().lower()  # Clean input
            elif input_type == 's':
                user_message = get_speech_input()
                if not user_message:
                    continue  # Skip if speech wasn't understood
            else:
                print("Invalid input. Please enter 'k' or 's'.")
                continue

            if user_message == 'quit':
                print("Goodbye!")
                break

            # Send the message to the Rasa chatbot
            send_message_to_rasa(user_message)

        except KeyboardInterrupt:
            print("\nExiting program. Goodbye!")
            break
