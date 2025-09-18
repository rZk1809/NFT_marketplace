# Lendify Dashboard Debug Guide

## Current Status
The Lendify application is set up with:
- ✅ Complete routing system (Landing, Login, Dashboard)
- ✅ Wallet authentication with MetaMask integration
- ✅ 3D NFT carousel with 6 mock NFTs
- ✅ NFT detail view with glassmorphism styling
- ✅ Enhanced particle background
- ✅ Debug logging added for troubleshooting

## Testing Steps

### 1. Access the Application
- Open your browser and go to: http://localhost:5173/
- You should see the landing page with the enhanced particle background

### 2. Navigate to Login
- Click "Launch App" to go to `/app/login`
- You should see a 3D login page with wallet connection

### 3. Connect Wallet
- Click "Connect Wallet" 
- MetaMask should prompt you to connect
- After connection, you should be redirected to `/app/dashboard`

### 4. Test Dashboard Features
- After wallet connection, the dashboard should show:
  - Your wallet address in the top-right
  - A welcome message in the 3D scene
  - 6 NFTs arranged in a circular carousel
  - Hover effects when moving mouse over NFTs
  - Click any NFT to open the detail view

### 5. Check Console Logs
Open browser DevTools (F12) and check the Console tab for:
- `DashboardPage render:` - Shows authentication state
- `NFTCarousel rendered with 6 NFTs` - Confirms carousel is loading
- `NFT clicked: [NFT Name]` - When clicking NFTs
- `NFT selected: [NFT Object]` - When NFT detail opens

## Common Issues & Solutions

### Issue: Dashboard appears blank after wallet connection

**Check:**
1. Console logs show `isAuthenticated: true`
2. No JavaScript errors in console
3. WebGL is supported (you confirmed this works with the test cube)

**Possible causes:**
- NFTCarousel component not rendering
- Canvas/Three.js setup issues
- CSS positioning conflicts

### Issue: NFTs don't respond to clicks

**Check:**
1. Console shows "NFT clicked" messages when clicking
2. NFT detail view appears/disappears
3. No pointer-events CSS blocking interactions

### Issue: 3D scene not visible

**Check:**
1. WebGL support is enabled
2. Camera positioning is correct
3. Lighting is adequate
4. No CSS z-index conflicts

## Debug Commands

If needed, you can add more debug logging:

```javascript
// In DashboardPage.jsx - add before return statement
console.log('Rendering dashboard with Canvas')

// In NFTCarousel.jsx - add in useFrame
console.log('NFT positions:', nftPositions.length)
```

## Current Ports
- Development server: http://localhost:5173/ (not 5174 as mentioned before)
- Vite is handling the dev server

## Next Steps
If the dashboard still appears blank:
1. Check browser console for any errors
2. Try disabling browser extensions temporarily
3. Test in incognito/private mode
4. Ensure MetaMask is unlocked and connected
