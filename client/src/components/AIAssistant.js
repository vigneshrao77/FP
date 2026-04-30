import React, { useState } from 'react';
import axios from 'axios';
import { useLeetCode } from '../context/LeetCodeContext';



const AIAssistant = () => {
  const { lcData, hasSynced } = useLeetCode();


  const [message, setMessage] = useState('');
  const [company, setCompany] = useState('');
  const [response, setResponse] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const companies = [
    'General Preparation',
    'Google', 'Amazon', 'Meta', 'Microsoft', 'Netflix', 'Apple', 
    'Uber', 'Airbnb', 'Lyft', 'DoorDash', 'Stripe', 'Palantir',
    'Adobe', 'Salesforce', 'Oracle', 'Cisco', 'Intel', 'IBM',
    'Twitter (X)', 'Snapchat', 'LinkedIn', 'Pinterest', 'Reddit',
    'Goldman Sachs', 'J.P. Morgan', 'Morgan Stanley', 'Bloomberg',
    'NVIDIA', 'AMD', 'Tesla', 'SpaceX', 'Spotify', 'Shopify',
    'Atlassian', 'ServiceNow', 'Zoom', 'Slack', 'Snowflake',
    'Tencent', 'Alibaba', 'ByteDance', 'Samsung', 'Sony', 'Nintendo',
    'Qualcomm', 'Broadcom', 'VMware', 'Dropbox', 'Box', 'Zillow',
    'Robinhood', 'Coinbase', 'Binance', 'Kraken', 'Visa', 'Mastercard',
    'American Express', 'PayPal', 'Square (Block)', 'Intuit', 'eBay',
    'Walmart Global Tech', 'Target Tech', 'Disney+', 'Hulu', 'Warner Bros',
    'Epic Games', 'Riot Games', 'Unity', 'Roblox', 'AutoDesk', 'MathWorks',
    'Databricks', 'Confluent', 'HashiCorp', 'MongoDB', 'Elastic',
    'CrowdStrike', 'Cloudflare', 'Okta', 'Twilio', 'SendGrid'
  ];

  const handleChat = async (e) => {
    e.preventDefault();
    if (!message && !company) return;

    setLoading(true);
    setError('');
    setResponse('');

    try {
      const token = localStorage.getItem('token');
      const res = await axios.post(
        'http://localhost:5000/api/ai/chat',
        {
          message: message || `Analyze my profile for ${company}`,
          lcData,
          company: company === 'General Preparation' ? '' : company
        },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      setResponse(res.data.response);
    } catch (err) {
      if (err.response?.status === 401) {
        setError('Your session has expired or is invalid. Please log in again.');
      } else {
        setError(err.response?.data?.message || 'Failed to connect to AI Mentor');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-zinc-200 mb-8 transition-all">
      <div className="gradient-bg p-4 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">AI DSA Mentor</h3>
            <p className="text-purple-100 text-xs">Powered by OpenRouter & LeetCode Data</p>
          </div>
        </div>
        {hasSynced && (
          <div className="hidden sm:block px-3 py-1 bg-white/10 rounded-full text-[10px] text-white font-medium uppercase tracking-wider border border-white/20">
            Analyzing: {lcData.username}
          </div>
        )}
      </div>

      <div className="p-6">
        {!hasSynced && (
          <div className="mb-6 p-4 bg-orange-50 border border-orange-100 rounded-lg flex items-start space-x-3">
            <svg className="w-5 h-5 text-orange-500 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <p className="text-sm text-orange-800">
              <strong>Tip:</strong> Sync your LeetCode profile first for more personalized AI advice.
            </p>
          </div>
        )}

        <form onSubmit={handleChat} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase mb-1 ml-1">Target Company</label>
              <select
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                className="w-full px-4 py-2 bg-zinc-50 border border-zinc-200 rounded-lg focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/20 transition-all outline-none text-zinc-700"
              >
                {companies.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div className="flex-1">
              <label className="block text-xs font-semibold text-gray-500 uppercase mb-1 ml-1">Specific Question (Optional)</label>
              <input
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="e.g., How do I improve my DP skills?"
                className="w-full px-4 py-2 bg-zinc-50 border border-zinc-200 rounded-lg focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/20 transition-all outline-none text-zinc-700"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full py-3 rounded-lg font-bold text-white transition-all transform active:scale-[0.98] flex items-center justify-center space-x-2 ${
              loading ? 'bg-zinc-400 cursor-not-allowed' : 'gradient-bg hover:opacity-90 shadow-sm'
            }`}
          >
            {loading ? (
              <>
                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span>Analyzing Stats...</span>
              </>
            ) : (
              <>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                </svg>
                <span>Get Personalized Strategy</span>
              </>
            )}
          </button>
        </form>

        {(response || error) && (
          <div className={`mt-6 p-6 rounded-xl border animate-fade-in ${
            error ? 'bg-red-50 border-red-100 text-red-700' : 'bg-zinc-50 border-zinc-200 text-zinc-800'
          }`}>
            {error ? (
              <div className="flex items-center space-x-2">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" /></svg>
                <span>{error}</span>
              </div>
            ) : (
              <div className="prose prose-indigo max-w-none ai-response-container">
                <div className="flex items-center space-x-2 mb-3 text-indigo-700 font-bold uppercase tracking-wider text-xs">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path d="M2 5a2 2 0 012-2h7a2 2 0 012 2v4a2 2 0 01-2 2H9l-3 3v-3H4a2 2 0 01-2-2V5z" /><path d="M15 7v2a4 4 0 01-4 4H9.828l-1.766 1.767c.28.149.599.233.938.233h2l3 3v-3h2a2 2 0 002-2V9a2 2 0 00-2-2h-1z" /></svg>
                  <span>AI Recommendations</span>
                </div>
                <div className="whitespace-pre-wrap leading-relaxed text-sm">
                  {response}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};



export default AIAssistant;
