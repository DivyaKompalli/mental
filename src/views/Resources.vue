<template>
  <div class="resources-container">
    <div class="resources-header">
      <h1><i class="fas fa-hands-helping"></i> Mental Health Resources</h1>
      <p class="subtitle">
        Find helpful articles, videos, and support services to support your mental wellbeing
      </p>
    </div>

    <div class="resource-categories">
      <!-- Articles Section -->
      <section class="category">
        <div class="category-header">
          <h2><i class="fas fa-book-open"></i> Educational Articles</h2>
          <p>Evidence-based information about mental health conditions and treatments</p>
        </div>
        <div class="resource-list">
          <div v-for="(article, index) in articles" :key="index" class="resource-card">
            <div class="card-icon"><i class="fas fa-file-alt"></i></div>
            <div class="card-content">
              <h3>{{ article.title }}</h3>
              <p>{{ article.description }}</p>
              <div class="card-footer">
                <a :href="article.link" target="_blank" class="resource-link">
                  Read Article <i class="fas fa-external-link-alt"></i>
                </a>
                <span class="reading-time"
                  ><i class="far fa-clock"></i> {{ article.duration }} read</span
                >
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- Videos Section -->
      <section class="category">
        <div class="category-header">
          <h2><i class="fas fa-film"></i> Guided Videos</h2>
          <p>Visual resources for relaxation, meditation, and self-help techniques</p>
        </div>
        <div class="resource-list">
          <div v-for="(video, index) in videos" :key="index" class="resource-card">
            <div class="card-icon"><i class="fas fa-play-circle"></i></div>
            <div class="card-content">
              <h3>{{ video.title }}</h3>
              <p>{{ video.description }}</p>
              <div class="card-footer">
                <a :href="video.link" target="_blank" class="resource-link">
                  Watch Video <i class="fas fa-external-link-alt"></i>
                </a>
                <span class="video-duration"
                  ><i class="far fa-clock"></i> {{ video.duration }}</span
                >
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- Hotlines Section -->
      <section class="category emergency-section">
        <div class="category-header">
          <h2><i class="fas fa-phone-alt"></i> Immediate Support</h2>
          <p>24/7 crisis support and mental health hotlines</p>
        </div>
        <div class="resource-list">
          <div
            v-for="(hotline, index) in hotlines"
            :key="index"
            class="resource-card emergency-card"
          >
            <div class="card-icon"><i class="fas fa-life-ring"></i></div>
            <div class="card-content">
              <h3>{{ hotline.name }}</h3>
              <p>{{ hotline.description }}</p>
              <div class="card-footer">
                <a :href="`tel:${hotline.number}`" class="emergency-link">
                  <i class="fas fa-phone"></i> {{ formatPhoneNumber(hotline.number) }}
                </a>
                <span class="availability"
                  ><i class="fas fa-check-circle"></i> {{ hotline.availability }}</span
                >
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  </div>
</template>

<script>
export default {
  name: 'Resources',
  data() {
    return {
      articles: [
        {
          title: 'Understanding Anxiety Disorders',
          description:
            'Comprehensive guide to recognizing symptoms, causes, and evidence-based treatment options for anxiety.',
          link: 'https://www.mentalhealth.org.uk/a-to-z/a/anxiety',
          duration: '8 min',
        },
        {
          title: 'Coping with Depression',
          description:
            'Practical strategies and professional advice for managing depressive symptoms in daily life.',
          link: 'https://www.nhs.uk/mental-health/conditions/clinical-depression/overview/',
          duration: '10 min',
        },
        {
          title: 'Mindfulness for Stress Reduction',
          description:
            'Learn how mindfulness techniques can help manage stress and improve mental wellbeing.',
          link: 'https://www.mindful.org/meditation/mindfulness-getting-started/',
          duration: '6 min',
        },
      ],
      videos: [
        {
          title: '10-Minute Mindfulness Meditation',
          description: 'Guided meditation session to help calm your mind and reduce anxiety.',
          link: 'https://youtu.be/5DIRRfoMYJA?si=gbovcDHjxuMX5kK0',
          duration: '10:22',
        },
        {
          title: 'Breathing Techniques for Anxiety',
          description:
            'Learn four powerful breathing exercises to manage panic attacks and anxiety.',
          link: 'https://youtu.be/ngMP4CtUQ8k?si=-Zdi1ti6IKDGnYNx',
          duration: '7:45',
        },
        {
          title: 'Cognitive Behavioral Therapy Basics',
          description: 'Introduction to CBT techniques you can practice at home.',
          link: 'https://youtu.be/5DIRRfoMYJA?si=gbovcDHjxuMX5kK0',
          duration: '14:30',
        },
      ],
      hotlines: [
        {
          name: 'National Suicide Prevention Lifeline',
          description: 'Free, confidential support for people in distress, 24/7.',
          number: '1-800-273-8255',
          availability: '24/7',
        },
        {
          name: 'Crisis Text Line',
          description: 'Text with a trained crisis counselor from anywhere in the US.',
          number: '741741',
          availability: '24/7',
        },
        {
          name: 'SAMHSA Treatment Referral',
          description: 'National helpline for substance abuse and mental health services.',
          number: '1-800-662-4357',
          availability: '24/7',
        },
      ],
    }
  },
  methods: {
    formatPhoneNumber(number) {
      // Format phone numbers for better readability
      if (number.length === 11 && number.startsWith('1')) {
        return `${number.substring(0, 1)}-${number.substring(1, 4)}-${number.substring(4, 7)}-${number.substring(7)}`
      }
      if (number.length === 10) {
        return `(${number.substring(0, 3)}) ${number.substring(3, 6)}-${number.substring(6)}`
      }
      return number
    },
  },
}
</script>

<style>
/* Base Styles */
:root {
  --primary-color: #4caf50;
  --primary-dark: #388e3c;
  --primary-light: #c8e6c9;
  --secondary-color: #2196f3;
  --danger-color: #f44336;
  --warning-color: #ff9800;
  --text-dark: #2c3e50;
  --text-medium: #546e7a;
  --text-light: #90a4ae;
  --background-light: #f5f7fa;
  --card-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  --card-shadow-hover: 0 8px 24px rgba(0, 0, 0, 0.12);
}

/* Resources Container */
.resources-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
  margin-left: 250px;
  font-family: 'Segoe UI', 'Roboto', 'Helvetica Neue', sans-serif;
}

.resources-header {
  text-align: center;
  margin-bottom: 3rem;
}

.resources-header h1 {
  color: var(--primary-dark);
  font-size: 2.5rem;
  margin-bottom: 0.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1rem;
}

.resources-header .subtitle {
  color: var(--text-medium);
  font-size: 1.1rem;
  max-width: 700px;
  margin: 0 auto;
  line-height: 1.6;
}

/* Category Sections */
.resource-categories {
  display: grid;
  gap: 3rem;
}

.category-header {
  margin-bottom: 1.5rem;
  padding-bottom: 0.5rem;
  border-bottom: 2px solid var(--primary-light);
}

.category-header h2 {
  color: var(--primary-dark);
  font-size: 1.8rem;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 0.5rem;
}

.category-header p {
  color: var(--text-medium);
  font-size: 1rem;
}

/* Resource List */
.resource-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 1.5rem;
}

/* Resource Cards */
.resource-card {
  background-color: white;
  border-radius: 12px;
  box-shadow: var(--card-shadow);
  padding: 1.5rem;
  display: flex;
  gap: 1.25rem;
  transition: all 0.3s ease;
  border: 1px solid #e0e0e0;
}

.resource-card:hover {
  transform: translateY(-5px);
  box-shadow: var(--card-shadow-hover);
  border-color: var(--primary-light);
}

.card-icon {
  font-size: 1.75rem;
  color: var(--primary-color);
  margin-top: 0.25rem;
}

.card-content {
  flex: 1;
}

.resource-card h3 {
  color: var(--text-dark);
  font-size: 1.25rem;
  margin-top: 0;
  margin-bottom: 0.75rem;
}

.resource-card p {
  color: var(--text-medium);
  font-size: 0.95rem;
  line-height: 1.6;
  margin-bottom: 1.25rem;
}

.card-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: auto;
}

/* Links */
.resource-link {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  color: var(--primary-color);
  text-decoration: none;
  font-weight: 600;
  font-size: 0.95rem;
  transition: color 0.2s;
}

.resource-link:hover {
  color: var(--primary-dark);
  text-decoration: underline;
}

.reading-time,
.video-duration {
  color: var(--text-light);
  font-size: 0.85rem;
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

/* Emergency Section */
.emergency-section .category-header h2 {
  color: var(--secondary-color);
}

.emergency-section .card-icon {
  color: var(--secondary-color);
}

.emergency-card {
  border-left: 4px solid var(--secondary-color);
}

.emergency-card:hover {
  border-color: var(--secondary-color);
}

.emergency-link {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  color: var(--secondary-color);
  text-decoration: none;
  font-weight: 600;
  font-size: 0.95rem;
  transition: color 0.2s;
}

.emergency-link:hover {
  color: #602fd3;
  text-decoration: underline;
}

.availability {
  color: var(--secondary-color);
  font-size: 0.85rem;
  display: flex;
  align-items: center;
  gap: 0.25rem;
  font-weight: 500;
}

/* Responsive Design */
@media (max-width: 992px) {
  .resources-container {
    margin-left: 0;
    padding: 1.5rem;
  }

  .resource-list {
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  }
}

@media (max-width: 768px) {
  .resources-header h1 {
    font-size: 2rem;
  }

  .resource-card {
    flex-direction: column;
    gap: 1rem;
  }

  .card-icon {
    align-self: center;
    font-size: 2rem;
  }
}

@media (max-width: 480px) {
  .resources-container {
    padding: 1rem;
  }

  .resource-list {
    grid-template-columns: 1fr;
  }
}
</style>
