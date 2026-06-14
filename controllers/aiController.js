const { GoogleGenerativeAI } = require('@google/generative-ai');
const Playlist = require('../models/Playlist');
const LikedSong = require('../models/LikedSong');
const Song = require('../models/Song');

exports.generatePlaylist = async (req, res) => {
  try {
    console.log('GEMINI KEY:', process.env.GEMINI_API_KEY ? 'loaded' : 'MISSING');
    const userId = req.user.id;
    
    const userPrompt = req.body.prompt;
    
    // 1. Get available catalog
    const allSongs = await Song.find({});
    const catalogInfo = allSongs
      .map(song => `ID: ${song._id.toString()} | "${song.title}" by ${song.artist} (${song.genre}, Mood: ${song.mood || 'unknown'})`)
      .join('\n');
      
    // 2. Send to Gemini 2.5 Flash
    const prompt = `User wants: '${userPrompt}'. \nFrom this song catalog:\n[${catalogInfo}]\nPick the 6 most fitting songs. Return ONLY a JSON array of song IDs. Do not include any markdown, backticks, or explanation. Only return a raw valid JSON array of strings.`;
    
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    // Explicitly using gemini-2.5-flash as requested
    const model = genAI.getGenerativeModel({ 
      model: 'gemini-2.5-flash',
      generationConfig: { responseMimeType: "application/json" }
    });
    
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error("AI Request Timed Out")), 5000)
    );

    const result = await Promise.race([
      model.generateContent(prompt),
      timeoutPromise
    ]);
    
    let text = result.response.text();
    
    // Clean up response if needed
    text = text.replace(/```json/gi, '').replace(/```/g, '').trim();
    
    const suggestedSongIds = JSON.parse(text);
    
    if (!Array.isArray(suggestedSongIds) || suggestedSongIds.length === 0) {
      throw new Error("Invalid AI response structure");
    }

    // 4. Create new playlist
    const playlistName = userPrompt || `✨ AI Mix - ${new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`;
    
    const newPlaylist = await Playlist.create({
      userId,
      name: playlistName,
      description: userPrompt ? `A smart playlist generated based on your prompt: "${userPrompt}"` : "An AI-generated smart playlist.",
      songs: suggestedSongIds,
      isAIGenerated: true
    });
    
    res.status(201).json(newPlaylist);
  } catch (error) {
    console.error('Error generating AI playlist:', error.message || error);
    try {
      const userId = req.user.id;
      const userPrompt = req.body.prompt;
      console.log('Falling back to random playlist generation...');
      const allSongs = await Song.find({});
      if (allSongs.length === 0) throw new Error("No songs in catalog");
      
      const shuffled = allSongs.sort(() => 0.5 - Math.random());
      const fallbackSongs = shuffled.slice(0, 6).map(s => s._id);
      
      const playlistName = userPrompt || `✨ Mix - ${new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`;
      const newPlaylist = await Playlist.create({
        userId,
        name: playlistName,
        description: userPrompt ? `A smart playlist generated based on your prompt: "${userPrompt}"` : "An AI-generated smart playlist.",
        songs: fallbackSongs,
        isAIGenerated: true
      });
      res.status(201).json(newPlaylist);
    } catch (fallbackError) {
      console.error('Fallback generation failed:', fallbackError.message || fallbackError);
      res.status(500).json({ error: 'Failed to generate playlist and fallback failed: ' + (error.message || error.toString()) });
    }
  }
};

exports.startRadio = async (req, res) => {
  try {
    console.log('GEMINI KEY:', process.env.GEMINI_API_KEY ? 'loaded' : 'MISSING');
    const { songId } = req.body;
    if (!songId) return res.status(400).json({ error: 'Song ID is required' });

    const seedSong = await Song.findById(songId);
    if (!seedSong) return res.status(404).json({ message: 'Song not found' });

    // 1. Get available catalog
    const allSongs = await Song.find({});
    const catalogInfo = allSongs
      .map(song => `ID: ${song._id.toString()} | "${song.title}" by ${song.artist} (${song.genre}, Mood: ${song.mood || 'unknown'})`)
      .join('\n');

    // 2. Construct Prompt
    const prompt = `The user wants a radio based on this song:
Title: ${seedSong.title}, Artist: ${seedSong.artist}, Genre: ${seedSong.genre}, Mood: ${seedSong.mood || 'unknown'}

From this catalog:
[${catalogInfo}]

Pick 10 songs that fit the same vibe. Return ONLY a JSON array of song IDs. Do not include any markdown, backticks, or explanation. Only return a raw valid JSON array of strings.`;

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ 
      model: 'gemini-2.5-flash',
      generationConfig: { responseMimeType: "application/json" }
    });

    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error("AI Request Timed Out")), 5000)
    );

    const result = await Promise.race([
      model.generateContent(prompt),
      timeoutPromise
    ]);
    
    let text = result.response.text();

    text = text.replace(/```json/gi, '').replace(/```/g, '').trim();
    const suggestedSongIds = JSON.parse(text);

    if (!Array.isArray(suggestedSongIds) || suggestedSongIds.length === 0) {
      throw new Error("Invalid AI response structure");
    }

    // Return the array of fully populated Song objects
    const songs = await Song.find({ _id: { $in: suggestedSongIds } });
    
    // Maintain the order returned by Gemini
    const orderedSongs = suggestedSongIds
      .map(id => songs.find(s => s._id.toString() === id))
      .filter(Boolean);

    res.json(orderedSongs);
  } catch (error) {
    console.error('Error starting radio:', error.message || error);
    try {
      console.log('Falling back to random radio queue...');
      const allSongs = await Song.find({});
      if (allSongs.length === 0) throw new Error("No songs in catalog");
      const shuffled = allSongs.sort(() => 0.5 - Math.random());
      const fallbackSongs = shuffled.slice(0, 10);
      res.json(fallbackSongs);
    } catch (fallbackError) {
      console.error('Fallback radio failed:', fallbackError.message || fallbackError);
      res.status(500).json({ error: 'Failed to generate radio queue: ' + (error.message || error.toString()) });
    }
  }
};
