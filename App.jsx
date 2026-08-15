import { useEffect, useState } from "react";
import "./App.css";

const quotes = [
  "Believe in yourself.",
  "Every day is a new beginning.",
  "Success comes from hard work.",
  "Never give up on your dreams.",
  "Small steps lead to big results.",
  "Keep learning and keep growing.",
  "Your future depends on what you do today.",
];

// Backend URL
const API_URL = import.meta.env.VITE_API_URL;

function App() {
  const [quote, setQuote] = useState(quotes[0]);
  const [note, setNote] = useState("");
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(false);

  // Generate random quote
  const newQuote = () => {
    const randomIndex = Math.floor(
      Math.random() * quotes.length
    );

    setQuote(quotes[randomIndex]);
  };

  // Get notes from backend
  const getNotes = async () => {
    try {

      console.log("Backend URL:", API_URL);

      const response = await fetch(
        `${API_URL}/api/notes`
      );

      if (!response.ok) {
        throw new Error(
          `Server returned ${response.status}`
        );
      }

      const data = await response.json();

      console.log("Notes response:", data);

      if (data.success) {
        setNotes(data.notes);
      }

    } catch (error) {

      console.error(
        "Could not connect to backend:",
        error
      );
    }
  };

  // Load notes when application starts
  useEffect(() => {

    if (!API_URL) {

      console.error(
        "VITE_API_URL is missing."
      );

      return;
    }

    getNotes();

  }, []);

  // Save note
  const saveNote = async (e) => {

    e.preventDefault();

    if (!note.trim()) {

      alert("Please write a note first!");

      return;
    }

    if (!API_URL) {

      alert(
        "Backend URL is not configured."
      );

      return;
    }

    setLoading(true);

    try {

      const response = await fetch(
        `${API_URL}/api/notes`,
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify({
            note: note.trim(),
          }),
        }
      );

      const data = await response.json();

      console.log(
        "Save response:",
        data
      );

      if (!response.ok || !data.success) {

        throw new Error(
          data.message ||
          "Failed to save note"
        );
      }

      setNote("");

      await getNotes();

      alert(
        "Note saved successfully!"
      );

    } catch (error) {

      console.error(
        "Save note error:",
        error
      );

      alert(
        "Could not connect to the backend."
      );

    } finally {

      setLoading(false);
    }
  };

  return (
    <div className="app">

      <div className="container">

        <h1>
          ✨ Quote Generator
        </h1>

        {/* Quote */}

        <div className="quote-card">

          <p>
            "{quote}"
          </p>

          <button
            onClick={newQuote}
          >
            New Quote
          </button>

        </div>

        {/* Note */}

        <div className="note-section">

          <h2>
            📝 Save Your Note
          </h2>

          <form
            onSubmit={saveNote}
          >

            <textarea
              placeholder="Write your note here..."
              value={note}
              onChange={(e) =>
                setNote(e.target.value)
              }
            />

            <button
              type="submit"
              disabled={loading}
            >
              {loading
                ? "Saving..."
                : "Save Note"}
            </button>

          </form>

        </div>

        {/* Saved Notes */}

        <div className="saved-notes">

          <h2>
            📚 Saved Notes
          </h2>

          {notes.length === 0 ? (

            <p className="empty">
              No notes saved yet.
            </p>

          ) : (

            notes.map(
              (item, index) => (

                <div
                  className="note"
                  key={`${item}-${index}`}
                >

                  <span>
                    {index + 1}.
                  </span>{" "}

                  {item}

                </div>

              )
            )

          )}

        </div>

      </div>

    </div>
  );
}

export default App;