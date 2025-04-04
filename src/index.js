const express = require('express');
const cors = require('cors');
const axios = require('axios');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

// === SUPABASE SETUP ===
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// === ROUTES ===

// Health check
app.get('/', (req, res) => {
  res.send('Argus backend is live');
});

// Add new skill
app.post('/add-skill', async (req, res) => {
  const { name, description, category } = req.body;
  const { data, error } = await supabase
    .from('skills')
    .insert([{ name, description, category }]);

  if (error) return res.status(400).json({ error });
  res.json({ success: true, data });
});

// Update task
app.post('/update-task', async (req, res) => {
  const { id, updates } = req.body;
  const { data, error } = await supabase
    .from('project_log')
    .update(updates)
    .eq('id', id);

  if (error) return res.status(400).json({ error });
  res.json({ success: true, data });
});

// OpenRouter chat
app.post('/chat', async (req, res) => {
  const { prompt } = req.body;

  try {
    const response = await axios.post(
      'https://openrouter.ai/api/v1/chat/completions',
      {
        model: 'mistralai/mixtral-8x7b',
        messages: [{ role: 'user', content: prompt }],
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
          'Content-Type': 'application/json',
        },
      }
    );

    res.json({ success: true, data: response.data });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// === LISTEN ===
app.listen(process.env.PORT || 3000, '0.0.0.0', () => {
  console.log('Argus backend running');
});
const express = require('express');
const cors = require('cors');
const axios = require('axios');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// ================= ROUTES =================

// Health check
app.get('/', (req, res) => {
  res.send('Argus backend is live');
});

// Add new skill
app.post('/add-skill', async (req, res) => {
  const { name, description, category } = req.body;
  const { data, error } = await supabase
    .from('skills')
    .insert([{ name, description, category }]);

  if (error) return res.status(400).json({ error });
  res.json({ success: true, data });
});

// ====== 🔥 NEW CHAT ROUTE HERE ======
app.post('/chat', async (req, res) => {
  const { prompt } = req.body;

  try {
    const response = await axios.post(
      'https://openrouter.ai/api/v1/chat/completions',
      {
        model: "mistralai/mistral-7b-instruct", // You can change the model here
        messages: [{ role: "user", content: prompt }]
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );

    res.json({ response: response.data });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message || 'Chat route failed' });
  }
});

app.listen(process.env.PORT || 3000, '0.0.0.0', () => {
  console.log('Argus backend running');
});
