import React, { useState } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';

const App = () => {
  const [url, setUrl] = useState('');
  const [videoInfo, setVideoInfo] = useState(null);
  const [resolution, setResolution] = useState('');
  const [downloading, setDownloading] = useState(false);

  const fetchVideoInfo = async () => {
    try {
      const response = await axios.get('http://localhost:8000/video_info/', { params: { url } });
      setVideoInfo(response.data);
    } catch (error) {
      alert('Error fetching video info');
    }
  };

  const downloadVideo = async () => {
    try {
      setDownloading(true);
      const response = await axios.get('http://localhost:8000/download/', {
        params: { url, resolution },
        responseType: 'blob',
      });
      const blob = new Blob([response.data], { type: 'video/mp4' });
      const link = document.createElement('a');
      link.href = window.URL.createObjectURL(blob);
      link.download = `${videoInfo.title}.mp4`;
      link.click();
      setDownloading(false);
    } catch (error) {
      alert('Error downloading video');
      setDownloading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-5">
      <motion.h1 initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-3xl font-bold mb-5">
        YouTube Video Downloader
      </motion.h1>

      <motion.input
        initial={{ opacity: 0, x: -50 }}
        animate={{ opacity: 1, x: 0 }}
        type="text"
        value={url}
        onChange={(e) => setUrl(e.target.value)}
        placeholder="Enter YouTube URL"
        className="p-2 rounded-lg text-black w-full max-w-lg mb-5"
      />

      <motion.button
        whileHover={{ scale: 1.1 }}
        className="bg-white text-black p-2 rounded-lg"
        onClick={fetchVideoInfo}
      >
        Fetch Video Info
      </motion.button>

      {videoInfo && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-10">
          <motion.img src={videoInfo.thumbnail_url} alt={videoInfo.title} className="rounded-lg mb-5" />
          <h2 className="text-xl mb-5">{videoInfo.title}</h2>
          
          <div className="flex flex-col items-center mb-5">
            <label className="mb-2">Select Resolution:</label>
            <select
              className="p-2 rounded-lg text-black"
              value={resolution}
              onChange={(e) => setResolution(e.target.value)}
            >
              <option value="">Select</option>
              {videoInfo.resolutions.map((res, idx) => (
                <option key={idx} value={res}>
                  {res}
                </option>
              ))}
            </select>
          </div>

          <motion.button
            whileHover={{ scale: 1.1 }}
            className={`bg-white text-black p-2 rounded-lg ${downloading ? 'opacity-50' : ''}`}
            onClick={downloadVideo}
            disabled={downloading}
          >
            {downloading ? 'Downloading...' : 'Download Video'}
          </motion.button>
        </motion.div>
      )}
    </div>
  );
};

export default App;
