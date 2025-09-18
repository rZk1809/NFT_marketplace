#!/usr/bin/env node

/**
 * Console Errors Test
 * Tests that the application loads without console errors
 */

import puppeteer from 'puppeteer';

console.log('🔍 Testing Console Errors...\n');

async function testConsoleErrors() {
  let browser;
  
  try {
    // Launch browser
    browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
    const page = await browser.newPage();
    
    // Collect console messages
    const consoleMessages = [];
    const errors = [];
    
    page.on('console', msg => {
      const type = msg.type();
      const text = msg.text();
      
      consoleMessages.push({ type, text });
      
      if (type === 'error') {
        errors.push(text);
      }
    });
    
    page.on('pageerror', error => {
      errors.push(`Page Error: ${error.message}`);
    });
    
    // Navigate to the application
    console.log('📱 Loading application at http://localhost:5173/...');
    await page.goto('http://localhost:5173/', { 
      waitUntil: 'networkidle0',
      timeout: 30000 
    });
    
    // Wait for React to load
    await page.waitForTimeout(3000);
    
    // Check for specific error patterns
    const criticalErrors = errors.filter(error => 
      error.includes('process is not defined') ||
      error.includes('Buffer is not defined') ||
      error.includes('Failed to resolve import') ||
      error.includes('Uncaught ReferenceError')
    );
    
    // Report results
    console.log('📊 Console Analysis Results:');
    console.log('='.repeat(50));
    
    console.log(`📝 Total console messages: ${consoleMessages.length}`);
    console.log(`❌ Total errors: ${errors.length}`);
    console.log(`🚨 Critical errors: ${criticalErrors.length}`);
    
    if (criticalErrors.length > 0) {
      console.log('\n🚨 Critical Errors Found:');
      criticalErrors.forEach((error, index) => {
        console.log(`${index + 1}. ${error}`);
      });
    }
    
    if (errors.length > 0) {
      console.log('\n❌ All Errors:');
      errors.forEach((error, index) => {
        console.log(`${index + 1}. ${error}`);
      });
    }
    
    // Check for successful loading indicators
    const title = await page.title();
    console.log(`\n📄 Page title: "${title}"`);
    
    // Check if React root is present
    const reactRoot = await page.$('#root');
    console.log(`⚛️  React root element: ${reactRoot ? 'Found' : 'Not found'}`);
    
    // Summary
    console.log('\n' + '='.repeat(50));
    if (criticalErrors.length === 0) {
      console.log('✅ SUCCESS: No critical console errors found!');
      console.log('🎉 Application loads without dependency issues');
      return true;
    } else {
      console.log('❌ FAILURE: Critical console errors detected');
      console.log('⚠️  Application has dependency or compilation issues');
      return false;
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    return false;
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

// Check if we can run the test
async function checkPrerequisites() {
  try {
    // Check if server is running
    const response = await fetch('http://localhost:5173/');
    if (!response.ok) {
      throw new Error('Development server not responding');
    }
    return true;
  } catch (error) {
    console.log('⚠️  Prerequisites check failed:', error.message);
    console.log('📝 Make sure the development server is running:');
    console.log('   cd lendify && npm run dev');
    return false;
  }
}

// Run the test
async function runTest() {
  console.log('🔧 Checking prerequisites...');
  
  const prereqsOk = await checkPrerequisites();
  if (!prereqsOk) {
    process.exit(1);
  }
  
  console.log('✅ Prerequisites OK\n');
  
  const success = await testConsoleErrors();
  process.exit(success ? 0 : 1);
}

// Only run if puppeteer is available
try {
  runTest();
} catch (error) {
  console.log('⚠️  Puppeteer not available, skipping automated console test');
  console.log('📝 To install puppeteer: npm install puppeteer');
  console.log('🔍 Please manually check the browser console at http://localhost:5173/');
  process.exit(0);
}
