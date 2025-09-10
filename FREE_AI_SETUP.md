# 🆓 Free AI API Setup Guide

This guide shows you how to get free AI API keys for your SkyePie weather app.

## 🚀 **Recommended: Groq API (FASTEST & MOST GENEROUS)**

### Why Groq?
- ✅ **14,400 requests per day** (completely free!)
- ✅ **Extremely fast** inference (sub-second responses)
- ✅ **No credit card required**
- ✅ **High-quality models** (Llama 3.1, Mixtral)

### Setup Steps:
1. Go to [console.groq.com](https://console.groq.com/)
2. Sign up with your email
3. Go to "API Keys" section
4. Create a new API key
5. Copy the key and add it to your `.env` file:
   ```
   EXPO_PUBLIC_GROQ_API_KEY=your_groq_api_key_here
   ```

---

## 🧠 **Alternative: Hugging Face Inference API**

### Why Hugging Face?
- ✅ **30,000 requests per month** (free)
- ✅ **Thousands of models** available
- ✅ **No credit card required**
- ✅ **Community-driven**

### Setup Steps:
1. Go to [huggingface.co](https://huggingface.co/)
2. Sign up for a free account
3. Go to Settings → Access Tokens
4. Create a new token with "Read" permissions
5. Add to your `.env` file:
   ```
   EXPO_PUBLIC_HUGGINGFACE_API_KEY=your_hf_token_here
   ```

---

## 🏠 **Local Option: Ollama (UNLIMITED)**

### Why Ollama?
- ✅ **Completely free** (no API limits)
- ✅ **Runs on your machine** (privacy)
- ✅ **No internet required** after setup
- ✅ **Unlimited usage**

### Setup Steps:
1. Install Ollama: [ollama.ai](https://ollama.ai/)
2. Download a model: `ollama pull llama3.1:8b`
3. Start Ollama server: `ollama serve`
4. Your app will automatically detect it

---

## 🔧 **How to Switch AI Providers**

The app automatically detects which AI services are available and uses the best one. You can also manually switch:

```typescript
import { aiServiceSelector } from './src/services';

// Check available providers
const providers = await aiServiceSelector.getAvailableProviders();
console.log(providers);

// Switch to a specific provider
await aiServiceSelector.setProvider('groq'); // or 'fallback'
```

---

## 📊 **Provider Comparison**

| Provider | Free Tier | Speed | Quality | Setup |
|----------|-----------|-------|---------|-------|
| **Groq** | 14,400/day | ⚡⚡⚡ | ⭐⭐⭐⭐ | Easy |
| **Hugging Face** | 30,000/month | ⚡⚡ | ⭐⭐⭐ | Easy |
| **Ollama** | Unlimited | ⚡ | ⭐⭐⭐⭐ | Medium |

---

## 🎯 **Quick Start**

1. **Get a Groq API key** (recommended)
2. **Add it to your `.env` file**:
   ```
   EXPO_PUBLIC_GROQ_API_KEY=your_key_here
   ```
3. **Restart your app** - it will automatically use Groq!

That's it! Your weather app will now have AI-powered recommendations without any costs.

---

## 🆘 **Troubleshooting**

### "API key not configured" error
- Make sure your `.env` file has the correct variable name
- Restart your development server after adding the key

### "Rate limit exceeded" error
- You've hit the free tier limit
- Wait for the limit to reset (daily for Groq, monthly for HF)
- Or switch to a different provider

### "Connection failed" error
- Check your internet connection
- Verify the API key is correct
- The service might be temporarily down

---

## 💡 **Pro Tips**

1. **Start with Groq** - it's the most generous free tier
2. **Keep fallback enabled** - ensures your app always works
3. **Monitor usage** - check your API dashboard regularly
4. **Use local Ollama** for development - unlimited testing
5. **Combine providers** - use different ones for different features

Happy coding! 🚀
