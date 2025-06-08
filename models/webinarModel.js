const pool = require('../db');

const Webinar = {
  getAllWebinars: async () => {
    const { rows } = await pool.query('SELECT * FROM webinars ORDER BY created_at DESC');
    return rows;
  },

  getWebinarById: async (id) => {
    const { rows } = await pool.query('SELECT * FROM webinars WHERE webinar_id = $1', [id]);
    return rows[0];
  },

  createWebinar: async (webinarData) => {
    const { title, description = null, launch_date = null, image_url = null, webinar_type, cost = 0 } = webinarData;

    const { rows } = await pool.query(
      `INSERT INTO webinars (title, description, launch_date, image_url, webinar_type, cost)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [title, description, launch_date, image_url, webinar_type, cost]
    );

    return rows[0];
  },

  updateWebinar: async (id, webinarData) => {
    const { title, description = null, launch_date = null, image_url = null, webinar_type, cost = 0 } = webinarData;

    const { rows } = await pool.query(
      `UPDATE webinars
       SET title = $1, description = $2, launch_date = $3, image_url = $4, webinar_type = $5, cost = $6
       WHERE webinar_id = $7 RETURNING *`,
      [title, description, launch_date, image_url, webinar_type, cost, id]
    );

    return rows[0];
  },

  deleteWebinar: async (id) => {
    await pool.query('DELETE FROM webinars WHERE webinar_id = $1', [id]);
  },
};

module.exports = Webinar;