document.addEventListener('DOMContentLoaded', () => {
  const applyForm = document.getElementById('applyForm');
  if (applyForm) {
    applyForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const data = {
        name: document.getElementById('name').value,
        email: document.getElementById('email').value,
        phone: document.getElementById('phone').value,
        resume: document.getElementById('resume').value
      };
      const res = await fetch('/api/apply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      if (res.ok) {
        alert('지원이 접수되었습니다.');
        applyForm.reset();
      } else {
        alert('오류가 발생했습니다.');
      }
    });
  }

  const table = document.getElementById('appTable');
  if (table) {
    loadApps();
  }

  async function loadApps() {
    const res = await fetch('/api/applications');
    const apps = await res.json();
    const tbody = table.querySelector('tbody');
    tbody.innerHTML = '';
    apps.forEach(app => {
      const tr = document.createElement('tr');
      tr.innerHTML = `<td>${app.id}</td>
        <td>${app.name}</td>
        <td>${app.status}${app.interviewDate ? ` (${app.interviewDate})` : ''}${app.result ? ` - ${app.result}` : ''}</td>
        <td>
          ${app.status === 'submitted' ? `<button data-action="verify" data-id="${app.id}">데이터 확인</button>` : ''}
          ${app.status === 'verified' ? `<button data-action="schedule" data-id="${app.id}">면접 일정 전달</button>` : ''}
          ${app.status === 'scheduled' ? `<button data-action="result" data-id="${app.id}">결과 입력</button>` : ''}
        </td>`;
      tbody.appendChild(tr);
    });
  }

  document.body.addEventListener('click', async (e) => {
    const btn = e.target;
    if (btn.dataset.action === 'verify') {
      await fetch('/api/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: btn.dataset.id })
      });
      loadApps();
    } else if (btn.dataset.action === 'schedule') {
      const date = prompt('면접 일시 입력 (예: 2025-07-01 10:00)');
      if (date) {
        await fetch('/api/schedule', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: btn.dataset.id, interviewDate: date })
        });
        loadApps();
      }
    } else if (btn.dataset.action === 'result') {
      const result = prompt('면접 결과 입력 (예: 합격/불합격)');
      if (result) {
        await fetch('/api/result', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: btn.dataset.id, result })
        });
        loadApps();
      }
    }
  });
});
