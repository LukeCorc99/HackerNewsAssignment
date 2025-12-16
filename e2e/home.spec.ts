import { test, expect } from '@playwright/test'

test.describe('Header', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
  })

  test.describe('Layout and Branding', () => {
    test('should display the header with logo and title', async ({ page }) => {
      const header = page.locator('header')
      await expect(header).toBeVisible()

      const logo = page.locator('text=Y')
      await expect(logo).toBeVisible()

      const title = page.locator('text=Hacker News')
      await expect(title).toBeVisible()
    })

    test('should display Submit Post button', async ({ page }) => {
      const submitBtn = page.getByTestId('submit')
      await expect(submitBtn).toBeVisible()
      await expect(submitBtn).toContainText('Submit Post')
    })

    test('should display user menu button', async ({ page }) => {
      const userBtn = page.getByTestId('user-menu')
      await expect(userBtn).toBeVisible()
    })
  })

  test.describe('User Menu - Logged Out', () => {
    test('should open dropdown when user menu clicked', async ({ page }) => {
      const userBtn = page.getByTestId('user-menu')
      await userBtn.click()

      const loginBtn = page.getByTestId('dropdown-login')
      const registerBtn = page.getByTestId('dropdown-register')

      await expect(loginBtn).toBeVisible()
      await expect(registerBtn).toBeVisible()
    })

    test('should display Login option in dropdown', async ({ page }) => {
      const userBtn = page.getByTestId('user-menu')
      await userBtn.click()

      const loginBtn = page.getByTestId('dropdown-login')
      await expect(loginBtn).toContainText('Log in')
    })

    test('should display Register option in dropdown', async ({ page }) => {
      const userBtn = page.getByTestId('user-menu')
      await userBtn.click()

      const registerBtn = page.getByTestId('dropdown-register')
      await expect(registerBtn).toContainText('Register')
    })

    test('should close dropdown when clicking outside', async ({ page }) => {
      const userBtn = page.getByTestId('user-menu')
      await userBtn.click()

      let loginBtn = page.getByTestId('dropdown-login')
      await expect(loginBtn).toBeVisible()

      await page.click('body', { position: { x: 0, y: 0 } })

      loginBtn = page.getByTestId('dropdown-login')
      await expect(loginBtn).not.toBeVisible()
    })

    test('should close dropdown after selecting Login', async ({ page }) => {
      const userBtn = page.getByTestId('user-menu')
      await userBtn.click()

      const loginBtn = page.getByTestId('dropdown-login')
      await loginBtn.click()

      const authModal = page.locator('text=Login').first()
      await expect(authModal).toBeVisible()
    })

    test('should close dropdown after selecting Register', async ({ page }) => {
      const userBtn = page.getByTestId('user-menu')
      await userBtn.click()

      const registerBtn = page.getByTestId('dropdown-register')
      await registerBtn.click()

      const authModal = page.locator('text=Create Account').first()
      await expect(authModal).toBeVisible()
    })
  })

  test.describe('Submit Post Button - Logged Out', () => {
    test('should open login modal when Submit Post clicked while logged out', async ({ page }) => {
      const submitBtn = page.getByTestId('submit')
      await submitBtn.click()

      const loginModal = page.locator('text=Login').first()
      await expect(loginModal).toBeVisible()
    })
  })

  test.describe('Login Flow', () => {
    test('should log in user and show Log out option', async ({ page }) => {
      const userBtn = page.getByTestId('user-menu')
      await userBtn.click()

      const loginBtn = page.getByTestId('dropdown-login')
      await loginBtn.click()

      const usernameInput = page.getByTestId('auth-username')
      const passwordInput = page.getByTestId('auth-password')
      const submitBtn = page.getByTestId('auth-submit')

      await usernameInput.fill('testuser')
      await passwordInput.fill('password123')
      await submitBtn.click()

      await page.waitForTimeout(2000)

      const userMenuBtn = page.getByTestId('user-menu')
      await userMenuBtn.click()

      const logoutBtn = page.getByTestId('dropdown-logout')
      await expect(logoutBtn).toBeVisible()
      await expect(logoutBtn).toContainText('Log out')
    })

    test('should show Submit Post modal after login from Submit Post button', async ({ page }) => {
      const submitBtn = page.getByTestId('submit')
      await submitBtn.click()

      const usernameInput = page.getByTestId('auth-username')
      const passwordInput = page.getByTestId('auth-password')
      const authSubmitBtn = page.getByTestId('auth-submit')

      await usernameInput.fill('testuser')
      await passwordInput.fill('password123')
      await authSubmitBtn.click()

      await page.waitForTimeout(2000)

      const submitPostModal = page.locator('text=Submit').first()
      await expect(submitPostModal).toBeVisible()
    })
  })

  test.describe('Submit Post Button - Logged In', () => {
    test('should open submit post modal directly when logged in', async ({ page }) => {
      const userBtn = page.getByTestId('user-menu')
      await userBtn.click()

      const loginBtn = page.getByTestId('dropdown-login')
      await loginBtn.click()

      const usernameInput = page.getByTestId('auth-username')
      const passwordInput = page.getByTestId('auth-password')
      const authSubmitBtn = page.getByTestId('auth-submit')

      await usernameInput.fill('testuser')
      await passwordInput.fill('password123')
      await authSubmitBtn.click()

      await page.waitForTimeout(2000)

      const submitBtn = page.getByTestId('submit')
      await submitBtn.click()

      const submitPostModal = page.locator('text=Submit').first()
      await expect(submitPostModal).toBeVisible()
    })
  })

  test.describe('Logout Flow', () => {
    test('should require login again after logout when clicking Submit Post', async ({ page }) => {
      const userBtn = page.getByTestId('user-menu')
      await userBtn.click()

      const loginBtn = page.getByTestId('dropdown-login')
      await loginBtn.click()

      const usernameInput = page.getByTestId('auth-username')
      const passwordInput = page.getByTestId('auth-password')
      const authSubmitBtn = page.getByTestId('auth-submit')

      await usernameInput.fill('testuser')
      await passwordInput.fill('password123')
      await authSubmitBtn.click()

      await page.waitForTimeout(2000)

      const userMenuBtn = page.getByTestId('user-menu')
      await userMenuBtn.click()

      const logoutBtn = page.getByTestId('dropdown-logout')
      await logoutBtn.click()

      await page.waitForTimeout(500)

      const submitBtn = page.getByTestId('submit')
      await submitBtn.click()

      const loginModal = page.locator('text=Login').first()
      await expect(loginModal).toBeVisible()
    })
  })

  test.describe('Accessibility', () => {
    test('should have proper ARIA labels on buttons', async ({ page }) => {
      const submitBtn = page.getByTestId('submit')
      await expect(submitBtn).toHaveAttribute('aria-label', 'Submit post')

      const userBtn = page.getByTestId('user-menu')
      await expect(userBtn).toHaveAttribute('aria-label', 'User menu')
    })

    test('should have aria-expanded attribute on user menu button', async ({ page }) => {
      const userBtn = page.getByTestId('user-menu')

      await expect(userBtn).toHaveAttribute('aria-expanded', 'false')

      await userBtn.click()

      await expect(userBtn).toHaveAttribute('aria-expanded', 'true')
    })

    test('should have proper role attributes on dropdown', async ({ page }) => {
      const userBtn = page.getByTestId('user-menu')
      await userBtn.click()

      const dropdown = page.locator('[role="menu"]')
      await expect(dropdown).toBeVisible()

      const menuItems = page.locator('[role="menuitem"]')
      const count = await menuItems.count()
      expect(count).toBeGreaterThan(0)
    })
  })

  test.describe('Visual Interaction', () => {
    test('should toggle dropdown chevron direction on click', async ({ page }) => {
      const userBtn = page.getByTestId('user-menu')

      await userBtn.click()
      await page.waitForTimeout(200)

      const dropdown = page.locator('[role="menu"]')
      await expect(dropdown).toBeVisible()

      await userBtn.click()
      await page.waitForTimeout(200)

      await expect(dropdown).not.toBeVisible()
    })

    test('should be keyboard accessible', async ({ page }) => {
      const submitBtn = page.getByTestId('submit')
      
      await submitBtn.focus()
      await expect(submitBtn).toBeFocused()
    })
  })
})