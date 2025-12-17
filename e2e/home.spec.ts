import { test, expect, type Page } from '@playwright/test'

test.describe('Post Management', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('domcontentloaded')
    await page.waitForTimeout(2000)
  })

  const loginUser = async (page: Page) => {
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
  }

  const switchToNewFeed = async (page: Page) => {
    const feedButton = page.locator('button[aria-label="Choose feed"]')
    await feedButton.click()

    const newOption = page.locator('[role="option"]').filter({ hasText: 'New' })
    await newOption.click()

    await page.waitForTimeout(2000)
  }

  test('user can submit a post successfully', async ({ page }) => {
    await loginUser(page)

    const submitBtn = page.getByTestId('submit')
    await submitBtn.click()

    const titleInput = page.getByTestId('submit-title')
    const urlInput = page.getByTestId('submit-url')
    const submitPostBtn = page.getByTestId('submit-post')

    await titleInput.fill('New Frontend Framework')
    await urlInput.fill('https://example.com/framework')
    await submitPostBtn.click()

    const successMsg = page.locator('text=Post submitted successfully')
    await expect(successMsg).toBeVisible()
  })

  test('user can see their submitted post on new feed', async ({ page }) => {
    await loginUser(page)

    const submitBtn = page.getByTestId('submit')
    await submitBtn.click()

    const titleInput = page.getByTestId('submit-title')
    const urlInput = page.getByTestId('submit-url')
    const submitPostBtn = page.getByTestId('submit-post')

    await titleInput.fill('React Performance Tips')
    await urlInput.fill('https://example.com/react-tips')
    await submitPostBtn.click()

    await page.waitForTimeout(2000)

    await switchToNewFeed(page)

    await page.waitForTimeout(2000)

    const userPost = page.locator('[data-testid="post-card"]').filter({ hasText: 'React Performance Tips' })
    await expect(userPost).toBeVisible({ timeout: 15000 })
    await expect(userPost).toContainText('by testuser')
  })

  test('user can edit their post successfully', async ({ page }) => {
    await loginUser(page)

    const submitBtn = page.getByTestId('submit')
    await submitBtn.click()

    const titleInput = page.getByTestId('submit-title')
    const urlInput = page.getByTestId('submit-url')
    const submitPostBtn = page.getByTestId('submit-post')

    await titleInput.fill('Original Post Title')
    await urlInput.fill('https://example.com/original')
    await submitPostBtn.click()

    await page.waitForTimeout(4000)

    await switchToNewFeed(page)

    await page.waitForTimeout(4000)

    const userPost = page.locator('[data-testid="post-card"]').filter({ hasText: 'Original Post Title' })
    await expect(userPost).toBeVisible({ timeout: 15000 })
    const editBtn = userPost.locator('button[aria-label="Edit post"]')

    await editBtn.click()

    const editTitleInput = page.getByTestId('submit-title')
    const editUrlInput = page.getByTestId('submit-url')
    const saveBtn = page.getByTestId('submit-post')

    await editTitleInput.clear()
    await editTitleInput.fill('Edited Post Title')
    await editUrlInput.clear()
    await editUrlInput.fill('https://example.com/edited')
    await saveBtn.click()

    const successMsg = page.locator('text=Post updated successfully')
    await expect(successMsg).toBeVisible()

    await page.waitForTimeout(3000)

    const editedPost = page.locator('[data-testid="post-card"]').filter({ hasText: 'Edited Post Title' })
    await expect(editedPost).toBeVisible({ timeout: 15000 })
    await expect(editedPost).toContainText('by testuser')
  })

  test('user can delete their post successfully', async ({ page }) => {
    await loginUser(page)

    const submitBtn = page.getByTestId('submit')
    await submitBtn.click()

    const titleInput = page.getByTestId('submit-title')
    const urlInput = page.getByTestId('submit-url')
    const submitPostBtn = page.getByTestId('submit-post')

    const postTitle = 'Post to Delete Successfully'
    await titleInput.fill(postTitle)
    await urlInput.fill('https://example.com/deleteme')
    await submitPostBtn.click()

    await page.waitForTimeout(2000)

    await switchToNewFeed(page)

    await page.waitForTimeout(2000)

    const userPost = page.locator('[data-testid="post-card"]').filter({ hasText: postTitle })
    await expect(userPost).toBeVisible({ timeout: 15000 })

    const deleteBtn = userPost.locator('button[aria-label="Delete post"]')

    page.on('dialog', async (dialog) => {
      await dialog.accept()
    })

    await deleteBtn.click()

    await page.waitForTimeout(1000)

    const deletedPost = page.locator('[data-testid="post-card"]').filter({ hasText: postTitle })
    await expect(deletedPost).not.toBeVisible()
  })
})

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

    test('should close dropdown when clicking outside', async ({ page }) => {
      const userBtn = page.getByTestId('user-menu')
      await userBtn.click()

      let loginBtn = page.getByTestId('dropdown-login')
      await expect(loginBtn).toBeVisible()

      await page.click('body', { position: { x: 0, y: 0 } })

      loginBtn = page.getByTestId('dropdown-login')
      await expect(loginBtn).not.toBeVisible()
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
  })
})

test.describe('Post Feed', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('domcontentloaded')
    await page.waitForTimeout(2000)
    await page.getByTestId('post-card').first().waitFor({ timeout: 15000 })
  })

  test.describe('Feed Selection', () => {
    test('should display Top feed by default', async ({ page }) => {
      const feedButton = page.locator('button[aria-label="Choose feed"]')
      await expect(feedButton).toBeVisible()
      await expect(feedButton).toContainText('Top')

      const posts = page.locator('[data-testid="post-card"]')
      await expect(posts.first()).toBeVisible()
    })

    test('should change feeds when selected', async ({ page }) => {
      const feedButton = page.locator('button[aria-label="Choose feed"]')
      await feedButton.click()

      const newOption = page.locator('[role="option"]').filter({ hasText: 'New' })
      await newOption.click()
      
      await page.waitForTimeout(1500)
      await page.getByTestId('post-card').first().waitFor({ timeout: 15000 })
      await expect(feedButton).toContainText('New')

      const posts = page.locator('[data-testid="post-card"]')
      await expect(posts.first()).toBeVisible()
    })
  })

  test.describe('View Modes', () => {
    test('should display list view by default', async ({ page }) => {
      const listBtn = page.getByTestId('view-list')
      await expect(listBtn).toHaveAttribute('aria-pressed', 'true')
    })

    test('should switch to grid view when clicked', async ({ page }) => {
      const gridBtn = page.getByTestId('view-grid')
      await gridBtn.click()

      await expect(gridBtn).toHaveAttribute('aria-pressed', 'true')
    })

    test('should maintain view mode when changing feeds', async ({ page }) => {
      const gridBtn = page.getByTestId('view-grid')
      await gridBtn.click()

      await expect(gridBtn).toHaveAttribute('aria-pressed', 'true')

      const feedButton = page.locator('button[aria-label="Choose feed"]')
      await feedButton.click()

      const newOption = page.locator('[role="option"]').filter({ hasText: 'New' })
      await newOption.click()
      
      await page.waitForTimeout(1500)
      await page.getByTestId('post-card').first().waitFor({ timeout: 15000 })

      await expect(gridBtn).toHaveAttribute('aria-pressed', 'true')
    })
  }) 

  test.describe('Post Display', () => {
    test('should display posts with all metadata', async ({ page }) => {
      const firstPost = page.getByTestId('post-card').first()
      await expect(firstPost).toBeVisible()

      const title = firstPost.locator('a').first()
      await expect(title).toBeVisible()
      await expect(title).toHaveAttribute('target', '_blank')

      await expect(firstPost).toContainText('points')
      await expect(firstPost).toContainText('by')
    })
  })
})