import { test, expect } from '@playwright/test';
import { Actor } from '../src/actors/Actor';
import { BrowseTheWeb } from '../src/abilities/BrowseTheWeb';
import { TakeScreenshots } from '../src/abilities/TakeScreenshots';
import { Navigate } from '../src/interactions/Navigate';
import { Click } from '../src/interactions/Click';
import { Login } from '../src/tasks/Login';
import { CurrentUrl } from '../src/questions/CurrentUrl';
import { Visibility } from '../src/questions/Visibility';
import { Text } from '../src/questions/Text';
import { LoginElements } from '../src/ui/LoginElements';
import { getCredentials } from '../src/helpers/auth';
import { setupPerformanceMonitoring } from '../src/helpers/metrics';

/**
 * Login Tests - Screenplay Pattern Example
 * 
 * This is the migrated version of login.spec.ts using Screenplay Pattern.
 * Compare with the original to see the differences.
 */
test.describe('Login Flow - Screenplay Pattern', () => {
  /**
   * Test: Successful login with valid credentials
   */
  test('should login successfully with valid credentials', async ({ page }) => {
    // Setup performance monitoring
    const metrics = setupPerformanceMonitoring(page);
    
    // Create actor with abilities
    const user = Actor.named('QA Test User')
      .whoCan(BrowseTheWeb.using(page))
      .whoCan(TakeScreenshots.withPrefix('login-screenplay'));
    
    // Get credentials for current environment
    const projectName = process.env.PROJECT_NAME || 'alpha';
    const creds = getCredentials(projectName);
    
    await test.step('Navigate to login page', async () => {
      await user.attemptsTo(
        Navigate.to(creds.baseUrl)
      );
      
      // Verify we're on login page
      const usernameVisible = await user.asks(
        Visibility.of(LoginElements.usernameInput(page))
      );
      expect(usernameVisible).toBe(true);
      
      // Take screenshot
      const screenshot = await page.screenshot({ fullPage: true });
      await test.info().attach('01-login-page-loaded', {
        body: screenshot,
        contentType: 'image/png'
      });
    });
    
    await test.step('Enter credentials and submit', async () => {
      await user.attemptsTo(
        Login.withCredentials(creds.email, creds.password)
      );
      
      // Take screenshot after login attempt
      const screenshot = await page.screenshot({ fullPage: true });
      await test.info().attach('02-after-login-submission', {
        body: screenshot,
        contentType: 'image/png'
      });
    });
    
    await test.step('Verify login success', async () => {
      // Check we're no longer on login page
      const currentUrl = await user.asks(CurrentUrl.value());
      console.log(`✅ Current URL after login: ${currentUrl}`);
      expect(currentUrl).not.toContain('/login');
      
      // Take final screenshot
      const screenshot = await page.screenshot({ fullPage: true });
      await test.info().attach('03-dashboard-loaded', {
        body: screenshot,
        contentType: 'image/png'
      });
    });
    
    // Print performance metrics
    metrics.printSummary();
  });
  
  /**
   * Test: Login validation - empty fields
   */
  test.skip('should validate empty login fields', async ({ page }) => {
    const user = Actor.named('Test User')
      .whoCan(BrowseTheWeb.using(page));
    
    const projectName = process.env.PROJECT_NAME || 'alpha';
    const creds = getCredentials(projectName);
    
    await test.step('Navigate and attempt empty login', async () => {
      await user.attemptsTo(
        Navigate.to(creds.baseUrl)
      );
      
      // Try to submit without filling fields
      await user.attemptsTo(
        Click.on(LoginElements.submitButton(page))
      );
    });
    
    await test.step('Verify still on login page', async () => {
      const currentUrl = await user.asks(CurrentUrl.value());
      expect(currentUrl).toContain('/login');
      
      // Verify username field still visible
      const usernameVisible = await user.asks(
        Visibility.of(LoginElements.usernameInput(page))
      );
      expect(usernameVisible).toBe(true);
    });
  });
  
  /**
   * Test: Login with invalid credentials
   */
  test.skip('should show error with invalid credentials', async ({ page }) => {
    const user = Actor.named('Test User')
      .whoCan(BrowseTheWeb.using(page));
    
    const projectName = process.env.PROJECT_NAME || 'alpha';
    const creds = getCredentials(projectName);
    
    await test.step('Navigate and login with bad credentials', async () => {
      await user.attemptsTo(
        Navigate.to(creds.baseUrl),
        Login.withCredentials('invalid@user.com', 'wrongpassword')
      );
    });
    
    await test.step('Verify error message displayed', async () => {
      const errorVisible = await user.asks(
        Visibility.of(LoginElements.errorMessage(page))
      );
      expect(errorVisible).toBe(true);
      
      const errorText = await user.asks(
        Text.of(LoginElements.errorMessage(page))
      );
      console.log(`Error message: ${errorText}`);
      expect(errorText.length).toBeGreaterThan(0);
    });
  });
});
