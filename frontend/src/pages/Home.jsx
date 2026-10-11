
import { useEffect, useState } from "react";
import API_URL from "../services/api";

function Home() {
  const [events, setEvents] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch(`${API_URL}/events`)
      .then((res) => {
        if (!res.ok) throw new Error("Could not load events");
        return res.json();
      })
      .then((data) => setEvents(data))
      .catch(() => setError("Events load nahi ho paaye."));
  }, []);

  return (
    <div className="container">
      <h1>Event Management System</h1>
      <h2>Upcoming Events</h2>

      {error && <p>{error}</p>}

      {events.length === 0 && !error && <p>No events available.</p>}

      {events.map((event) => (
        <div className="event" key={event._id}>
          <h3>{event.title}</h3>
          <p>{event.description}</p>
          <p>Date: {new Date(event.date).toLocaleDateString()}</p>
          <p>Venue: {event.venue}</p>
          <p>Organizer: {event.organizer}</p>
          <p>Capacity: {event.capacity}</p>
        </div>
      ))}
    </div>
  );
}

export default Home;