const express = require('express');
const cors = require('cors');
const axios = require('axios');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

// Supabase client
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

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

// Chat route (OpenRouter)
app.post('/chat', async (req, res) => {
  const { prompt } = req.body;

  try {
    const response = await axios.post(
      'https://openrouter.ai/api/v1/chat/completions',
      {
        model: 'mistralai/mistral-7b-instruct',
        messages: [{ role: 'user', content: prompt }]
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );

    const reply = response.data.choices?.[0]?.message?.content || '[No reply]';
    res.json({ reply });
  } catch (error) {
    console.error('Chat Error:', error.response?.data || error.message);
    res.status(500).json({ error: error.message });
  }
});

// Start server
app.listen(process.env.PORT || 3000, '0.0.0.0', () => {
  console.log('Argus backend running');
});
