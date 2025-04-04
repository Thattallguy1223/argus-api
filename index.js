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

// ========== ROUTES ==========

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

// Update a task
app.post('/update-task', async (req, res) => {
  const { id, updates } = req.body;
  const { data, error } = await supabase
    .from('project_log')
    .update(updates)
    .eq('id', id);

  if (error) return res.status(400).json({ error });
  res.json({ success: true, data });
});

// View project log
app.get('/project_log', async (req, res) => {
  const { data, error } = await supabase.from('project_log').select('*');
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

// Chat with Argus via OpenRouter
app.post('/chat', async (req, res) => {
  const { message, model = "mistral" } = req.body;

  if (!message) return res.status(400).json({ error: 'Message is required' });

  try {
    const response = await axios.post(
      'https://openrouter.ai/api/v1/chat/completions',
      {
        model: `openrouter/${model}`,
        messages: [{ role: "user", content: message }],
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
          'Content-Type': 'application/json',
        },
      }
    );

    const reply = response.data.choices[0].message.content;
    res.json({ reply });
  } catch (error) {
    console.error("Chat Error:", error.response?.data || error.message);
    res.status(500).json({ error: 'Chat request failed', details: error.message });
  }
});

// Server start
const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Argus backend running on port ${PORT}`);
});
app.post('/chat', async (req, res) => {
  try {
    const { messages } = req.body;

    const response = await axios.post(
      'https://openrouter.ai/api/v1/chat/completions',
      {
        model: 'openai/gpt-3.5-turbo',
        messages,
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
          'Content-Type': 'application/json',
        },
      }
    );

    res.json(response.data);
  } catch (error) {
    console.error('Chat error:', error.message);
    res.status(500).json({ error: error.message });
  }
});
