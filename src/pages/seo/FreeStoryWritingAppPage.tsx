/**
 * FreeStoryWritingAppPage - SEO Landing Page
 * Route: /free-story-writing-app
 * Target: free online story writing app, poetry writing app keywords
 */
import { useNavigate } from 'react-router-dom';
import SEOHead from '../../components/seo/SEOHead';
import styles from './FreeStoryWritingAppPage.module.css';

export default function FreeStoryWritingAppPage() {
  const navigate = useNavigate();
  const baseUrl = import.meta.env.VITE_APP_URL || 'https://storyverse.co.in';

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    "name": "Storyverse",
    "applicationCategory": "DesignApplication",
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "USD"
    },
    "description": "Free online story writing app for writers and poets. Create stories, poems, and build your writing portfolio.",
    "operatingSystem": "Web Browser",
    "url": `${baseUrl}/free-story-writing-app`
  };

  return (
    <>
      <SEOHead
        title="Free Online Story Writing App for Writers & Poets | Storyverse"
        description="Storyverse is a free online story writing app and poetry writing platform for writers. Create stories, write poems, build character profiles, and share your creative writing with a community of writers and readers."
        canonical={`${baseUrl}/free-story-writing-app`}
        ogType="website"
        structuredData={structuredData}
      />
      
      <div className={styles.container}>
        <main className={styles.content}>
          <section className={styles.hero}>
            <h1 className={styles.mainHeading}>
              Free Online Story Writing App for Writers & Poets
            </h1>
            <p className={styles.subtitle}>
              Storyverse is a powerful, free online writing platform designed for creative writers, 
              storytellers, and poets who want to bring their stories to life.
            </p>
            <button 
              className={styles.ctaButton}
              onClick={() => navigate('/auth/signup')}
            >
              Start Writing for Free
            </button>
          </section>

          <section className={styles.section}>
            <h2 className={styles.sectionHeading}>What is Storyverse?</h2>
            <p className={styles.paragraph}>
              Storyverse is a comprehensive free online story writing app that empowers writers 
              to create, organize, and share their creative work. Whether you're writing novels, 
              short stories, screenplays, or poetry, Storyverse provides all the tools you need 
              in one intuitive platform.
            </p>
          </section>

          <section className={styles.section}>
            <h2 className={styles.sectionHeading}>Who is Storyverse For?</h2>
            <p className={styles.paragraph}>
              Our free story writing app is perfect for:
            </p>
            <ul className={styles.list}>
              <li>Creative writers working on novels and short stories</li>
              <li>Poets looking for a dedicated poetry writing app online</li>
              <li>Screenwriters developing scripts and screenplays</li>
              <li>Documentary writers crafting non-fiction narratives</li>
              <li>Aspiring authors building their writing portfolio</li>
              <li>Writing enthusiasts who want to share their work with readers</li>
            </ul>
          </section>

          <section className={styles.section}>
            <h2 className={styles.sectionHeading}>Key Features for Writers</h2>
            <ul className={styles.list}>
              <li><strong>Story Editor:</strong> Write and organize your stories with our intuitive editor</li>
              <li><strong>Poetry Writing Tools:</strong> Dedicated poetry writing app features for poets</li>
              <li><strong>Character Profiles:</strong> Build detailed character profiles with images and descriptions</li>
              <li><strong>Chapter Organization:</strong> Structure your stories into chapters and acts</li>
              <li><strong>Privacy Controls:</strong> Keep your work private or share it publicly</li>
              <li><strong>Community Engagement:</strong> Connect with other writers and readers</li>
              <li><strong>Writing Analytics:</strong> Track your writing progress and word counts</li>
            </ul>
          </section>

          <section className={styles.section}>
            <h2 className={styles.sectionHeading}>Why Choose Our Free Story Writing App?</h2>
            <p className={styles.paragraph}>
              Unlike other writing apps, Storyverse is completely free and designed specifically 
              for creative writers. No subscriptions, no hidden fees—just a powerful platform to 
              help you write better stories. Our story writing app online gives you the freedom 
              to create without limitations.
            </p>
          </section>

          <section className={styles.section}>
            <h2 className={styles.sectionHeading}>Start Writing Today</h2>
            <p className={styles.paragraph}>
              Join thousands of writers who use Storyverse as their go-to free online story writing 
              app. Whether you're drafting your first story or your hundredth poem, our platform 
              provides the tools and community support you need to succeed.
            </p>
            <button 
              className={styles.ctaButton}
              onClick={() => navigate('/auth/signup')}
            >
              Create Your Free Account
            </button>
          </section>

          <section className={styles.section}>
            <h2 className={styles.sectionHeading}>Frequently Asked Questions</h2>
            <div className={styles.faq}>
              <h3 className={styles.faqQuestion}>Is Storyverse really free?</h3>
              <p className={styles.paragraph}>
                Yes! Storyverse is a completely free online story writing app with no hidden costs 
                or subscription fees. All features are available to all users.
              </p>
            </div>
            <div className={styles.faq}>
              <h3 className={styles.faqQuestion}>Can I use Storyverse for poetry writing?</h3>
              <p className={styles.paragraph}>
                Absolutely! Storyverse functions as both a story writing app and a poetry writing 
                app online, with dedicated tools for poets to create and share their work.
              </p>
            </div>
            <div className={styles.faq}>
              <h3 className={styles.faqQuestion}>Do I own my writing?</h3>
              <p className={styles.paragraph}>
                Yes, you retain full ownership and rights to all content you create on Storyverse. 
                Your stories and poems belong to you.
              </p>
            </div>
          </section>
        </main>
      </div>
    </>
  );
}
