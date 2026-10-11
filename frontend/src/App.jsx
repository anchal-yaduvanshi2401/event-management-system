import { useEffect, useState } from "react";
import "./index.css";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5001/api";

const EMPTY_FORM = {
  title: "",
  description: "",
  date: "",
  venue: "",
  organizer: "",
  capacity: "",
};

function App() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [form, setForm] = useState({ ...EMPTY_FORM });
  const [editingId, setEditingId] = useState(null);
  const [saving, setSaving] = useState(false);

  const fetchEvents = async () => {
    try {
      const response = await fetch(`${API_URL}/events`);
      if (!response.ok) throw new Error("Could not load events");

      const data = await response.json();
      setEvents(Array.isArray(data) ? data : data.events || []);
      setError("");
    } catch {
      setError("Backend connection failed. Please check the server.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const resetForm = () => {
    setForm({ ...EMPTY_FORM });
    setEditingId(null);
  };

  const handleEdit = (event) => {
    setEditingId(event._id);
    setForm({
      title: event.title || "",
      description: event.description || "",
      date: event.date ? new Date(event.date).toISOString().slice(0, 10) : "",
      venue: event.venue || "",
      organizer: event.organizer || "",
      capacity: event.capacity == null ? "" : String(event.capacity),
    });

    document.getElementById("add-event")?.scrollIntoView({
      behavior: "smooth",
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (saving) return;

    setSaving(true);
    const isEditing = editingId !== null;

    try {
      const response = await fetch(
        isEditing
          ? `${API_URL}/events/${editingId}`
          : `${API_URL}/events`,
        {
          method: isEditing ? "PUT" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ...form,
            capacity: Number(form.capacity),
          }),
        }
      );

      if (!response.ok) {
        throw new Error(`Request failed: ${response.status}`);
      }

      await fetchEvents();
      resetForm();
      alert(isEditing ? "Event updated successfully!" : "Event added successfully!");
    } catch (err) {
      alert(`Could not ${isEditing ? "update" : "add"} event: ${err.message}`);
    } finally {
      setSaving(false);
    }
  };

  const deleteEvent = async (id) => {
    if (!window.confirm("Are you sure you want to delete this event?")) return;

    try {
      const response = await fetch(`${API_URL}/events/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) throw new Error(`Delete failed: ${response.status}`);

      if (editingId === id) resetForm();
      await fetchEvents();
      alert("Event deleted successfully!");
    } catch (err) {
      alert(`Event delete failed: ${err.message}`);
    }
  };

  return (
    <div className="app">
      <header className="navbar">
        <a className="logo" href="/">EventEase</a>
        <nav>
          <a href="#events">Events</a>
          <a href="#add-event">Create Event</a>
        </nav>
      </header>

      <main>
        <section className="hero">
          <div className="hero-content">
            <p className="eyebrow">PLAN • ORGANIZE • CELEBRATE</p>
            <h1>Every event starts<br />with a great idea.</h1>
            <p className="hero-text">
              Discover events, manage your plans, and bring people together
              with one simple event management platform.
            </p>
            <a className="primary-btn" href="#events">Explore Events ↗</a>
          </div>

          <div className="hero-card">
            <div className="hero-icon">✦</div>
            <p className="card-small">MAKE IT MEMORABLE</p>
            <h2>Your event.<br />Your moment.</h2>
            <div className="card-line"></div>
            <p>Ideas become experiences here.</p>
          </div>
        </section>

        <section className="stats">
          <div><h2>{events.length}</h2><p>Listed Events</p></div>
          <div><h2>01</h2><p>Simple Platform</p></div>
          <div><h2>∞</h2><p>New Possibilities</p></div>
        </section>

        <section className="events-section" id="events">
          <div className="section-heading">
            <div>
              <p className="eyebrow">WHAT'S HAPPENING</p>
              <h2>Upcoming Events</h2>
            </div>
            <a className="text-link" href="#add-event">+ Create an event</a>
          </div>

          {loading && <p className="message">Loading events...</p>}
          {error && <p className="message error">{error}</p>}

          {!loading && !error && events.length === 0 && (
            <div className="empty-state">
              <span>✧</span>
              <h3>No events yet</h3>
              <p>Create the first event and it will appear here.</p>
            </div>
          )}

          <div className="event-grid">
            {events.map((event) => (
              <article className="event-card" key={event._id}>
                <div className="event-top">
                  <span className="event-tag">EVENT</span>
                  <span className="event-symbol">✦</span>
                </div>

                <h3>{event.title}</h3>
                <p className="event-description">{event.description}</p>

                <div className="event-details">
                  <p>📅 {event.date ? new Date(event.date).toLocaleDateString() : "Date not set"}</p>
                  <p>📍 {event.venue}</p>
                  <p>👤 {event.organizer}</p>
                  <p>🎟 Capacity: {event.capacity}</p>
                </div>

                <div className="event-actions">
                  <button
                    className="edit-btn"
                    type="button"
                    onClick={() => handleEdit(event)}
                  >
                    Edit Event
                  </button>
                  <button
                    className="delete-btn"
                    type="button"
                    onClick={() => deleteEvent(event._id)}
                  >
                    Delete Event
                  </button>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="form-section" id="add-event">
          <div className="form-intro">
            <p className="eyebrow">BRING YOUR IDEA TO LIFE</p>
            <h2>
              {editingId ? <>Update your<br />event.</> : <>Create your<br />next event.</>}
            </h2>
            <p>
              {editingId
                ? "Edit the event details and save your changes."
                : "Fill in the details to add an event to the platform."}
            </p>
          </div>

          <form className="event-form" onSubmit={handleSubmit}>
            <label>
              Event Title
              <input name="title" value={form.title} onChange={handleChange}
                placeholder="e.g. Tech Fest 2026" required />
            </label>

            <label>
              Description
              <textarea name="description" value={form.description}
                onChange={handleChange} placeholder="Tell us about your event" required />
            </label>

            <div className="form-row">
              <label>
                Date
                <input type="date" name="date" value={form.date}
                  onChange={handleChange} required />
              </label>
              <label>
                Capacity
                <input type="number" name="capacity" min="1"
                  value={form.capacity} onChange={handleChange}
                  placeholder="100" required />
              </label>
            </div>

            <label>
              Venue
              <input name="venue" value={form.venue} onChange={handleChange}
                placeholder="Event location" required />
            </label>

            <label>
              Organizer
              <input name="organizer" value={form.organizer}
                onChange={handleChange} placeholder="Organizer name" required />
            </label>

            <button className="submit-btn" type="submit" disabled={saving}>
              {saving ? "Saving..." : editingId ? "Update Event ↗" : "Create Event ↗"}
            </button>

            {editingId && (
              <button className="cancel-edit-btn" type="button"
                onClick={resetForm} disabled={saving}>
                Cancel Edit
              </button>
            )}
          </form>
        </section>
      </main>

      <footer>
        <a className="logo" href="/">EventEase</a>
        <p>Making every gathering count.</p>
        <span>© 2026 EventEase</span>
      </footer>
    </div>
  );
}

export default App;