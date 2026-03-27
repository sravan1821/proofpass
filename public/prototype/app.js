/* ==========================================
   PROOFPASS — COMPLETE APPLICATION LOGIC
   ========================================== */

document.addEventListener('DOMContentLoaded', () => {
  initNavbar();
  initParticles();
  initScrollAnimations();
  initCounters();
  initVerifyTabs();
  initIssueForm();
  initDashboardSearch();
});

/* ---- NAVBAR ---- */
function initNavbar() {
  const navbar = document.getElementById('navbar');
  const hamburger = document.getElementById('hamburger');
  const navLinks = document.getElementById('navLinks');

  // Scroll effect
  if (navbar) {
    window.addEventListener('scroll', () => {
      navbar.classList.toggle('scrolled', window.scrollY > 50);
    });
  }

  // Mobile menu
  if (hamburger && navLinks) {
    hamburger.addEventListener('click', () => {
      navLinks.classList.toggle('open');
      hamburger.classList.toggle('active');
    });
  }
}

/* ---- FLOATING PARTICLES ---- */
function initParticles() {
  const container = document.getElementById('particles');
  if (!container) return;

  for (let i = 0; i < 30; i++) {
    const particle = document.createElement('div');
    particle.classList.add('particle');
    particle.style.left = Math.random() * 100 + '%';
    particle.style.animationDelay = Math.random() * 15 + 's';
    particle.style.animationDuration = (10 + Math.random() * 20) + 's';
    particle.style.width = (2 + Math.random() * 4) + 'px';
    particle.style.height = particle.style.width;
    particle.style.opacity = 0.1 + Math.random() * 0.3;
    container.appendChild(particle);
  }
}

/* ---- SCROLL ANIMATIONS ---- */
function initScrollAnimations() {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
        }
      });
    },
    { threshold: 0.1, rootMargin: '0px 0px -50px 0px' }
  );

  document.querySelectorAll('.animate-on-scroll').forEach(el => {
    observer.observe(el);
  });
}

/* ---- COUNTER ANIMATION ---- */
function initCounters() {
  const counters = document.querySelectorAll('[data-target]');

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          animateCounter(entry.target);
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.5 }
  );

  counters.forEach(counter => observer.observe(counter));
}

function animateCounter(el) {
  const target = parseInt(el.getAttribute('data-target'));
  const duration = 2000;
  const startTime = performance.now();

  function update(currentTime) {
    const elapsed = currentTime - startTime;
    const progress = Math.min(elapsed / duration, 1);

    // Ease out cubic
    const eased = 1 - Math.pow(1 - progress, 3);
    const current = Math.floor(eased * target);

    el.textContent = current.toLocaleString();

    if (progress < 1) {
      requestAnimationFrame(update);
    } else {
      el.textContent = target.toLocaleString();
    }
  }

  requestAnimationFrame(update);
}

/* ---- VERIFY TABS ---- */
function initVerifyTabs() {
  const tabs = document.querySelectorAll('.verify-tab');

  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      // Remove active from all tabs and contents
      document.querySelectorAll('.verify-tab').forEach(t => t.classList.remove('active'));
      document.querySelectorAll('.verify-tab-content').forEach(c => c.classList.remove('active'));

      // Activate clicked tab
      tab.classList.add('active');
      const tabId = 'tab-' + tab.getAttribute('data-tab');
      const content = document.getElementById(tabId);
      if (content) content.classList.add('active');
    });
  });
}

/* ---- ISSUE FORM ---- */
function initIssueForm() {
  const form = document.getElementById('issueForm');
  if (!form) return;

  // Live preview updates
  const fields = {
    participantName: 'previewName',
    eventName: 'previewEvent',
    projectTitle: 'previewProject',
    eventDate: 'previewDate',
    issuer: 'previewIssuer',
  };

  Object.keys(fields).forEach(fieldId => {
    const input = document.getElementById(fieldId);
    if (input) {
      input.addEventListener('input', () => {
        const preview = document.getElementById(fields[fieldId]);
        if (preview) {
          if (fieldId === 'projectTitle') {
            preview.textContent = 'Project: ' + (input.value || 'Your Project');
          } else if (fieldId === 'issuer') {
            preview.textContent = 'Issued by: ' + (input.value || 'Authority');
          } else if (fieldId === 'eventDate') {
            const d = new Date(input.value);
            preview.textContent = isNaN(d) ? 'Date' : d.toLocaleDateString('en-US', {
              year: 'numeric', month: 'long', day: 'numeric'
            });
          } else {
            preview.textContent = input.value || preview.getAttribute('data-default') || '';
          }
        }
      });
    }
  });

  // Role badge update
  const roleSelect = document.getElementById('role');
  if (roleSelect) {
    roleSelect.addEventListener('change', () => {
      const badge = document.getElementById('previewBadge');
      if (badge) {
        const icons = {
          participant: '🎓',
          winner: '🏆',
          'runner-up': '🥈',
          mentor: '🎯',
          organizer: '🎪',
        };
        badge.innerHTML = `<i class="fas fa-award"></i> ${roleSelect.value.charAt(0).toUpperCase() + roleSelect.value.slice(1)}`;
      }
    });
  }

  // Form submission
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    handleIssueCertificate();
  });
}

function handleIssueCertificate() {
  const certID = generateCertID();

  // Build certificate data
  const certData = {
    id: certID,
    name: document.getElementById('participantName').value,
    email: document.getElementById('participantEmail').value,
    college: document.getElementById('college').value,
    role: document.getElementById('role').value,
    event: document.getElementById('eventName').value,
    date: document.getElementById('eventDate').value,
    issuer: document.getElementById('issuer').value,
    project: document.getElementById('projectTitle').value,
    description: document.getElementById('projectDesc').value,
    techStack: document.getElementById('techStack').value,
    projectLink: document.getElementById('projectLink').value,
    teamMembers: document.getElementById('teamMembers').value,
    issuedAt: new Date().toISOString(),
    status: 'active',
  };

  // Save to localStorage
  saveCertificate(certData);

  // Generate QR code in preview
  generateQRCode(certID);

  // Update preview ID
  const previewIDEl = document.getElementById('previewID');
  if (previewIDEl) previewIDEl.textContent = 'ID: ' + certID;

  // Show actions
  const actions = document.getElementById('previewActions');
  if (actions) actions.style.display = 'flex';

  // Update portfolio link
  const portfolioBtn = document.getElementById('viewPortfolioBtn');
  if (portfolioBtn) {
    portfolioBtn.href = `certificate.html?id=${certID}`;
  }

  // Show success modal
  const modalCertID = document.getElementById('modalCertID');
  if (modalCertID) modalCertID.textContent = certID;

  const modal = document.getElementById('successModal');
  if (modal) modal.classList.add('show');
}

function generateCertID() {
  const chars = '0123456789ABCDEF';
  let id = 'PP-';
  for (let i = 0; i < 6; i++) {
    id += chars[Math.floor(Math.random() * chars.length)];
  }
  return id;
}

function generateQRCode(certID) {
  const container = document.getElementById('previewQR');
  if (!container) return;

  container.innerHTML = '';

  const verifyURL = `${window.location.origin}/certificate.html?id=${certID}`;

  // Check if QRCode library is loaded
  if (typeof QRCode !== 'undefined') {
    new QRCode(container, {
      text: verifyURL,
      width: 80,
      height: 80,
      colorDark: '#6366f1',
      colorLight: '#ffffff',
      correctLevel: QRCode.CorrectLevel.M,
    });
  } else {
    // Fallback: show a styled placeholder
    container.innerHTML = `<div style="width:80px;height:80px;background:#eef2ff;display:flex;align-items:center;justify-content:center;border-radius:8px;border:2px solid #6366f1"><i class="fas fa-qrcode" style="font-size:2rem;color:#6366f1"></i></div>`;
  }
}

function saveCertificate(data) {
  let certificates = JSON.parse(localStorage.getItem('proofpass_certs') || '[]');
  certificates.unshift(data);
  localStorage.setItem('proofpass_certs', JSON.stringify(certificates));
}

function getCertificate(id) {
  let certificates = JSON.parse(localStorage.getItem('proofpass_certs') || '[]');
  return certificates.find(c => c.id === id);
}

function closeModal() {
  const modal = document.getElementById('successModal');
  if (modal) modal.classList.remove('show');
}

function downloadCertificate() {
  alert('📥 Certificate download will use html2canvas/jsPDF in production!');
}

function shareCertificate() {
  const certID = document.getElementById('previewID')?.textContent?.replace('ID: ', '') || 'PP-DEMO';
  const url = `${window.location.origin}/certificate.html?id=${certID}`;

  if (navigator.share) {
    navigator.share({
      title: 'ProofPass Certificate',
      text: 'Verify my certificate on ProofPass!',
      url: url,
    });
  } else {
    navigator.clipboard.writeText(url).then(() => {
      alert('🔗 Certificate link copied to clipboard!');
    });
  }
}

function shareLinkedIn() {
  const url = encodeURIComponent(window.location.href);
  const title = encodeURIComponent('Verified Certificate — ProofPass');
  window.open(
    `https://www.linkedin.com/sharing/share-offsite/?url=${url}`,
    '_blank',
    'width=600,height=400'
  );
}

/* ---- VERIFY CERTIFICATE ---- */
function verifyCertificate() {
  const input = document.getElementById('verifyInput');
  const resultContainer = document.getElementById('verifyResult');
  if (!input || !resultContainer) return;

  const certID = input.value.trim().toUpperCase();

  if (!certID) {
    showNotification('Please enter a Certificate ID', 'warning');
    return;
  }

  // Show loading
  resultContainer.innerHTML = `
    <div style="text-align:center;padding:60px">
      <div class="loading-spinner"></div>
      <p style="margin-top:16px;color:var(--text-secondary)">Verifying certificate...</p>
    </div>
  `;

  // Simulate verification delay
  setTimeout(() => {
    const cert = getCertificate(certID);

    if (cert) {
      showVerifySuccess(resultContainer, cert);
      addRecentVerification(cert);
    } else {
      // Check for demo certificates
      const demoCerts = getDemoCertificates();
      const demoCert = demoCerts.find(c => c.id === certID);

      if (demoCert) {
        showVerifySuccess(resultContainer, demoCert);
        addRecentVerification(demoCert);
      } else {
        showVerifyFailed(resultContainer, certID);
      }
    }
  }, 1500);
}

function getDemoCertificates() {
  return [
    {
      id: 'PP-7A3B2F',
      name: 'Rahul Sharma',
      email: 'rahul@email.com',
      college: 'JNTUH',
      role: 'winner',
      event: 'JNTU Hackathon 2025',
      date: '2025-01-15',
      issuer: 'Department of CSE, JNTUH',
      project: 'ProofPass',
      description: 'QR-verifiable certificate platform',
      techStack: 'HTML, CSS, JS, Python, Firebase',
      status: 'active',
    },
    {
      id: 'PP-9D4E1C',
      name: 'Priya Reddy',
      email: 'priya@email.com',
      college: 'IIIT Hyderabad',
      role: 'runner-up',
      event: 'JNTU Hackathon 2025',
      date: '2025-01-15',
      issuer: 'Department of CSE, JNTUH',
      project: 'EcoTrack',
      description: 'Environmental tracking system',
      techStack: 'React, Node.js, MongoDB',
      status: 'active',
    },
  ];
}

function showVerifySuccess(container, cert) {
  const dateFormatted = cert.date ? new Date(cert.date).toLocaleDateString('en-US', {
    year: 'numeric', month: 'long', day: 'numeric'
  }) : 'N/A';

  container.innerHTML = `
    <div class="verify-success">
      <div class="result-header">
        <div class="result-icon success">
          <i class="fas fa-check-circle"></i>
        </div>
        <div>
          <div class="result-status success">✅ Certificate Verified</div>
          <p style="color:var(--text-secondary);font-size:0.85rem;margin-top:4px">
            This certificate is authentic and active
          </p>
        </div>
      </div>
      <div class="result-details">
        <div class="result-detail-item">
          <span class="result-detail-label">Certificate ID</span>
          <span class="result-detail-value" style="font-family:monospace">${cert.id}</span>
        </div>
        <div class="result-detail-item">
          <span class="result-detail-label">Name</span>
          <span class="result-detail-value">${cert.name}</span>
        </div>
        <div class="result-detail-item">
          <span class="result-detail-label">Event</span>
          <span class="result-detail-value">${cert.event}</span>
        </div>
        <div class="result-detail-item">
          <span class="result-detail-label">Project</span>
          <span class="result-detail-value">${cert.project}</span>
        </div>
        <div class="result-detail-item">
          <span class="result-detail-label">Role</span>
          <span class="result-detail-value" style="text-transform:capitalize">${cert.role}</span>
        </div>
        <div class="result-detail-item">
          <span class="result-detail-label">Date</span>
          <span class="result-detail-value">${dateFormatted}</span>
        </div>
        <div class="result-detail-item">
          <span class="result-detail-label">Issuer</span>
          <span class="result-detail-value">${cert.issuer || 'ProofPass Authority'}</span>
        </div>
        <div class="result-detail-item">
          <span class="result-detail-label">Status</span>
          <span class="status-badge active">Active</span>
        </div>
      </div>
      <a href="certificate.html?id=${cert.id}" class="btn btn-primary btn-full">
        <i class="fas fa-external-link"></i> View Full Certificate & Portfolio
      </a>
    </div>
  `;
}

function showVerifyFailed(container, certID) {
  container.innerHTML = `
    <div class="verify-failed">
      <div class="result-header">
        <div class="result-icon failed">
          <i class="fas fa-times-circle"></i>
        </div>
        <div>
          <div class="result-status failed">❌ Verification Failed</div>
          <p style="color:var(--text-secondary);font-size:0.85rem;margin-top:4px">
            No certificate found with this ID
          </p>
        </div>
      </div>
      <div class="result-details">
        <div class="result-detail-item">
          <span class="result-detail-label">Searched ID</span>
          <span class="result-detail-value" style="font-family:monospace;color:var(--danger)">${certID}</span>
        </div>
        <div class="result-detail-item">
          <span class="result-detail-label">Status</span>
          <span class="status-badge revoked">Not Found</span>
        </div>
      </div>
      <p style="text-align:center;color:var(--text-secondary);font-size:0.85rem;margin-top:16px">
        💡 Try demo IDs: <code style="background:var(--primary-bg);color:var(--primary);padding:2px 6px;border-radius:4px">PP-7A3B2F</code> or
        <code style="background:var(--primary-bg);color:var(--primary);padding:2px 6px;border-radius:4px">PP-9D4E1C</code>
      </p>
    </div>
  `;
}

function addRecentVerification(cert) {
  const list = document.getElementById('recentList');
  if (!list) return;

  const item = document.createElement('div');
  item.className = 'recent-item';
  item.style.animation = 'fadeUp 0.3s ease forwards';
  item.innerHTML = `
    <div class="recent-status valid"><i class="fas fa-check-circle"></i></div>
    <div class="recent-info">
      <span class="recent-id">${cert.id}</span>
      <span class="recent-name">${cert.name}</span>
    </div>
    <span class="recent-time">Just now</span>
  `;
  list.prepend(item);
}

function simulateScan() {
  const input = document.getElementById('verifyInput');
  if (input) input.value = 'PP-7A3B2F';

  // Switch to manual tab
  document.querySelectorAll('.verify-tab').forEach(t => t.classList.remove('active'));
  document.querySelectorAll('.verify-tab-content').forEach(c => c.classList.remove('active'));

  const manualTab = document.querySelector('[data-tab="manual"]');
  const manualContent = document.getElementById('tab-manual');
  if (manualTab) manualTab.classList.add('active');
  if (manualContent) manualContent.classList.add('active');

  // Trigger verification
  setTimeout(() => verifyCertificate(), 300);
}

/* ---- DASHBOARD SEARCH ---- */
function initDashboardSearch() {
  const searchInput = document.getElementById('searchInput');
  if (!searchInput) return;

  searchInput.addEventListener('input', () => {
    const query = searchInput.value.toLowerCase();
    const rows = document.querySelectorAll('#certTableBody tr');

    rows.forEach(row => {
      const text = row.textContent.toLowerCase();
      row.style.display = text.includes(query) ? '' : 'none';
    });
  });
}

/* ---- NOTIFICATIONS ---- */
function showNotification(message, type = 'info') {
  const notification = document.createElement('div');
  notification.style.cssText = `
    position: fixed;
    top: 90px;
    right: 24px;
    padding: 14px 24px;
    background: ${type === 'warning' ? '#fef3c7' : type === 'success' ? '#ecfdf5' : '#eef2ff'};
    color: ${type === 'warning' ? '#92400e' : type === 'success' ? '#065f46' : '#3730a3'};
    border-radius: 12px;
    font-family: var(--font);
    font-weight: 600;
    font-size: 0.9rem;
    z-index: 3000;
    box-shadow: 0 10px 25px rgba(0,0,0,0.1);
    animation: fadeDown 0.3s ease forwards;
    border: 1px solid ${type === 'warning' ? '#fbbf24' : type === 'success' ? '#34d399' : '#818cf8'};
  `;
  notification.textContent = message;
  document.body.appendChild(notification);

  setTimeout(() => {
    notification.style.animation = 'fadeUp 0.3s ease forwards reverse';
    setTimeout(() => notification.remove(), 300);
  }, 3000);
}

/* ---- CERTIFICATE PAGE LOADER ---- */
(function loadCertificatePage() {
  const urlParams = new URLSearchParams(window.location.search);
  const certID = urlParams.get('id');

  if (!certID) return;

  // Try to find certificate
  const cert = getCertificate(certID) || getDemoCertificates().find(c => c.id === certID);

  if (!cert) return;

  // Update page elements if they exist
  const updateEl = (id, value) => {
    const el = document.getElementById(id);
    if (el && value) el.textContent = value;
  };

  updateEl('certPageID', cert.id);
  updateEl('certName', cert.name);
  updateEl('certEvent', cert.event);
  updateEl('certProject', 'Project: ' + cert.project);
  updateEl('certIssuer', cert.issuer);

  if (cert.date) {
    const d = new Date(cert.date);
    updateEl('certDate', d.toLocaleDateString('en-US', {
      year: 'numeric', month: 'long', day: 'numeric'
    }));
  }

  if (cert.description) {
    updateEl('portfolioDesc', cert.description);
  }

  if (cert.techStack) {
    const container = document.getElementById('techTags');
    if (container) {
      container.innerHTML = cert.techStack.split(',').map(t =>
        `<span class="tech-tag">${t.trim()}</span>`
      ).join('');
    }
  }
})();