<?php
session_start();
header('Content-Type: text/html; charset=utf-8');

// Password protection
$PASSWORD = 'aymen123@';

if (isset($_GET['logout'])) {
    unset($_SESSION['admin_auth']);
    header('Location: admin.php');
    exit;
}

if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['password'])) {
    if ($_POST['password'] === $PASSWORD) {
        $_SESSION['admin_auth'] = true;
        header('Location: admin.php');
        exit;
    } else {
        $error = "Mot de passe incorrect.";
    }
}

// API endpoint for fetching/updating status via AJAX
$statusFile = __DIR__ . '/api/statuses.json';
if (isset($_GET['api']) && !empty($_SESSION['admin_auth'])) {
    if ($_GET['api'] === 'update_status' && $_SERVER['REQUEST_METHOD'] === 'POST') {
        $input = json_decode(file_get_contents('php://input'), true);
        $id = $input['id'] ?? '';
        $status = $input['status'] ?? 'Nouveau';
        if ($id) {
            $statuses = file_exists($statusFile) ? json_decode(file_get_contents($statusFile), true) : [];
            $statuses[$id] = $status;
            file_put_contents($statusFile, json_encode($statuses, JSON_PRETTY_PRINT));
            echo json_encode(['success' => true]);
            exit;
        }
    }
}

if (empty($_SESSION['admin_auth'])) {
    ?>
    <!DOCTYPE html>
    <html lang="fr">
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Connexion Administration • Réservations</title>
      <style>
        * { box-sizing: border-box; margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; }
        body { background: #08090c; color: #fff; display: flex; align-items: center; justify-content: center; min-height: 100vh; padding: 16px; }
        .card { background: #12141a; border: 1px solid #232732; border-radius: 14px; padding: 32px 24px; width: 100%; max-width: 360px; box-shadow: 0 10px 40px rgba(0,0,0,0.6); text-align: center; }
        .badge { background: #d4af37; color: #000; font-weight: 900; font-size: 13px; padding: 4px 10px; border-radius: 6px; display: inline-block; margin-bottom: 14px; letter-spacing: 0.5px; }
        h1 { font-size: 19px; margin-bottom: 22px; color: #f8fafc; font-weight: 700; }
        input[type=password] { width: 100%; padding: 13px 15px; background: #0b0c10; border: 1px solid #2d3340; border-radius: 8px; color: #fff; font-size: 15px; margin-bottom: 16px; outline: none; transition: border-color 0.2s; }
        input[type=password]:focus { border-color: #d4af37; }
        button { width: 100%; padding: 13px; background: #d4af37; color: #000; border: none; border-radius: 8px; font-weight: 800; font-size: 15px; cursor: pointer; transition: background 0.2s; }
        button:hover { background: #e5c358; }
        .err { color: #f87171; font-size: 13px; margin-bottom: 14px; }
      </style>
    </head>
    <body>
      <div class="card">
        <div class="badge">ESPACE PRO</div>
        <h1>Gestion des Réservations</h1>
        <?php if (!empty($error)) echo '<div class="err">' . htmlspecialchars($error) . '</div>'; ?>
        <form method="POST">
          <input type="password" name="password" placeholder="Mot de passe administrateur" required autofocus>
          <button type="submit">Accéder au tableau de bord</button>
        </form>
      </div>
    </body>
    </html>
    <?php
    exit;
}

// Read submissions
$logFile = __DIR__ . '/api/submissions.log';
$submissions = [];
$statuses = file_exists($statusFile) ? json_decode(file_get_contents($statusFile), true) : [];

if (file_exists($logFile)) {
    $content = file_get_contents($logFile);
    $blocks = explode("\n---\n", trim($content));
    $idx = 0;
    foreach ($blocks as $block) {
        $block = trim($block);
        if (empty($block)) continue;
        $json = json_decode($block, true);
        if ($json) {
            $ts = $json['timestamp'] ?? '';
            $id = md5($ts . ($json['data']['Nom'] ?? '') . ($json['data']['Telephone'] ?? '') . $idx);
            $json['id'] = $id;
            $json['status'] = $statuses[$id] ?? 'Nouveau';
            $submissions[] = $json;
            $idx++;
        }
    }
}
$submissions = array_reverse($submissions);
$host = $_SERVER['HTTP_HOST'] ?? 'Taxi Dashboard';
$isTaxiDrive = (strpos($host, 'taxidrive') !== false);
$themeColor = $isTaxiDrive ? '#d4af37' : '#e8c88a';
$brandTitle = $isTaxiDrive ? 'TAXI DRIVE' : 'CITY TAXIS';
?>
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Administration • <?php echo htmlspecialchars($brandTitle); ?></title>
  <style>
    :root {
      --primary: <?php echo $themeColor; ?>;
      --bg-dark: #08090c;
      --card-bg: #111319;
      --card-border: #1f232d;
      --card-sub: #0b0c10;
      --text: #f1f5f9;
      --text-muted: #64748b;
      --accent-blue: #2563eb;
      --accent-green: #16a34a;
      --accent-amber: #d97706;
      --accent-purple: #9333ea;
    }
    * { box-sizing: border-box; margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif; }
    body { background: var(--bg-dark); color: var(--text); padding: 12px; min-height: 100vh; }
    
    /* Top Bar */
    .topbar { max-width: 1100px; margin: 0 auto 12px auto; display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #1e2430; padding-bottom: 12px; flex-wrap: wrap; gap: 10px; }
    .brand-logo { font-size: 17px; font-weight: 900; color: var(--primary); display: flex; align-items: center; gap: 8px; letter-spacing: 0.5px; }
    .badge-icon { background: var(--primary); color: #000; font-size: 11px; padding: 3px 7px; border-radius: 4px; font-weight: 900; }
    .top-actions { display: flex; align-items: center; gap: 8px; }
    .btn-top { background: #161a22; border: 1px solid #28303f; color: #cbd5e1; font-size: 12px; padding: 6px 12px; border-radius: 6px; text-decoration: none; cursor: pointer; font-weight: 600; display: inline-flex; align-items: center; gap: 4px; }
    .btn-top:hover { border-color: var(--primary); color: #fff; }

    /* KPI Summary Stats */
    .kpi-grid { max-width: 1100px; margin: 0 auto 16px auto; display: grid; grid-template-columns: repeat(auto-fit, minmax(140px, 1fr)); gap: 10px; }
    .kpi-card { background: var(--card-bg); border: 1px solid var(--card-border); border-radius: 10px; padding: 12px; text-align: center; }
    .kpi-num { font-size: 22px; font-weight: 800; color: var(--primary); margin-bottom: 2px; }
    .kpi-label { font-size: 11px; color: var(--text-muted); text-transform: uppercase; font-weight: 700; letter-spacing: 0.5px; }

    /* Control Panel (Search, Date Filter, Grouping) */
    .controls { max-width: 1100px; margin: 0 auto 16px auto; background: var(--card-bg); border: 1px solid var(--card-border); border-radius: 12px; padding: 14px; display: flex; flex-direction: column; gap: 12px; }
    .search-row { display: flex; gap: 8px; flex-wrap: wrap; }
    .search-input { flex: 1; min-width: 240px; background: var(--card-sub); border: 1px solid #272d3b; border-radius: 8px; color: #fff; padding: 10px 14px; font-size: 14px; outline: none; }
    .search-input:focus { border-color: var(--primary); }
    
    .filter-pills { display: flex; gap: 6px; flex-wrap: wrap; align-items: center; }
    .filter-pill { background: #161922; border: 1px solid #262c3b; color: #94a3b8; padding: 6px 12px; border-radius: 6px; font-size: 12px; font-weight: 600; cursor: pointer; transition: all 0.15s; }
    .filter-pill:hover, .filter-pill.active { background: var(--primary); color: #000; border-color: var(--primary); font-weight: 800; }
    
    .custom-date-wrap { display: flex; gap: 6px; align-items: center; flex-wrap: wrap; }
    .date-input { background: var(--card-sub); border: 1px solid #272d3b; color: #fff; padding: 6px 10px; border-radius: 6px; font-size: 12px; outline: none; }
    .date-input:focus { border-color: var(--primary); }

    .grouping-bar { display: flex; justify-content: space-between; align-items: center; border-top: 1px solid #1a1e28; padding-top: 10px; flex-wrap: wrap; gap: 10px; }
    .group-label { font-size: 12px; color: var(--text-muted); font-weight: 700; margin-right: 6px; }
    .group-btn { background: #161922; border: 1px solid #262c3b; color: #94a3b8; padding: 5px 10px; border-radius: 5px; font-size: 11px; cursor: pointer; font-weight: 600; }
    .group-btn.active { background: #2563eb; color: #fff; border-color: #2563eb; }

    /* Results Container */
    .container { max-width: 1100px; margin: 0 auto; display: flex; flex-direction: column; gap: 14px; }
    
    /* Group Header */
    .group-header { background: #141720; border: 1px solid #232836; border-left: 4px solid var(--primary); border-radius: 8px; padding: 10px 14px; font-size: 14px; font-weight: 800; color: #fff; display: flex; justify-content: space-between; align-items: center; margin-top: 6px; }
    .group-badge { background: rgba(212,175,55,0.18); color: var(--primary); font-size: 11px; padding: 2px 8px; border-radius: 12px; font-weight: 700; }

    /* Reservation Cards */
    .sub-card { background: var(--card-bg); border: 1px solid var(--card-border); border-radius: 10px; padding: 14px; position: relative; transition: border-color 0.2s; }
    .sub-card:hover { border-color: #3b4252; }
    .sub-top { display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px; border-bottom: 1px solid #1a1e28; padding-bottom: 8px; flex-wrap: wrap; gap: 6px; }
    
    .type-badge { font-size: 11px; font-weight: 800; background: rgba(212,175,55,0.15); color: var(--primary); padding: 3px 8px; border-radius: 4px; text-transform: uppercase; }
    .sub-time { font-size: 11px; color: var(--text-muted); font-weight: 500; }
    
    /* Status Select */
    .status-select { background: #0c0d12; border: 1px solid #2b3140; color: #fff; padding: 4px 8px; border-radius: 5px; font-size: 11px; font-weight: 700; cursor: pointer; outline: none; }
    .status-Nouveau { border-color: #eab308; color: #facc15; }
    .status-Contacté { border-color: #3b82f6; color: #60a5fa; }
    .status-Confirmé { border-color: #22c55e; color: #4ade80; }
    .status-Terminé { border-color: #64748b; color: #94a3b8; }
    .status-Annulé { border-color: #ef4444; color: #f87171; }

    .sub-name { font-size: 16px; font-weight: 800; color: #fff; margin-bottom: 8px; display: flex; align-items: center; gap: 8px; }
    
    /* Action Buttons */
    .actions { display: flex; gap: 6px; margin-bottom: 12px; flex-wrap: wrap; }
    .btn { text-decoration: none; font-size: 11px; font-weight: 700; padding: 6px 11px; border-radius: 5px; display: inline-flex; align-items: center; gap: 4px; cursor: pointer; border: none; }
    .btn-call { background: var(--accent-blue); color: #fff; }
    .btn-wa { background: var(--accent-green); color: #fff; }
    .btn-mail { background: #334155; color: #fff; }
    .btn-copy { background: #1e293b; color: #cbd5e1; border: 1px solid #334155; }
    .btn:hover { opacity: 0.9; }

    /* Key Information Grid */
    .grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 6px; font-size: 11px; }
    .item { background: var(--card-sub); padding: 6px 8px; border-radius: 6px; border: 1px solid #161822; }
    .item-label { color: var(--text-muted); font-size: 9px; text-transform: uppercase; font-weight: 800; margin-bottom: 2px; letter-spacing: 0.5px; }
    .item-val { color: #f8fafc; font-weight: 600; word-break: break-word; font-size: 12px; }
    .item.highlight { border-color: #2a3346; background: #111520; }
    .item.highlight .item-val { color: #38bdf8; font-weight: 700; }

    .empty-state { text-align: center; padding: 50px 20px; color: var(--text-muted); background: var(--card-bg); border-radius: 12px; border: 1px dashed var(--card-border); }
    
    .footer-note { text-align: center; margin: 30px 0 20px; font-size: 11px; color: #475569; }

    @media (max-width: 600px) {
      .kpi-grid { grid-template-columns: repeat(2, 1fr); }
      .grid { grid-template-columns: 1fr; }
    }
  </style>
</head>
<body>

  <!-- Top Navigation -->
  <div class="topbar">
    <div class="brand-logo">
      <span class="badge-icon"><?php echo $isTaxiDrive ? 'TD' : 'CT'; ?></span>
      <span><?php echo htmlspecialchars($brandTitle); ?> • GESTION RÉSIDER</span>
    </div>
    <div class="top-actions">
      <button class="btn-top" onclick="exportCSV()">📥 Exporter CSV</button>
      <button class="btn-top" onclick="window.print()">🖨️ Imprimer</button>
      <a href="?logout=1" class="btn-top" style="color:#f87171;">Déconnexion</a>
    </div>
  </div>

  <!-- KPI Summary Cards -->
  <div class="kpi-grid">
    <div class="kpi-card">
      <div class="kpi-num" id="kpi-total">0</div>
      <div class="kpi-label">Total Demandes</div>
    </div>
    <div class="kpi-card">
      <div class="kpi-num" id="kpi-today">0</div>
      <div class="kpi-label">Aujourd'hui</div>
    </div>
    <div class="kpi-card">
      <div class="kpi-num" id="kpi-week">0</div>
      <div class="kpi-label">Cette Semaine</div>
    </div>
    <div class="kpi-card">
      <div class="kpi-num" id="kpi-month">0</div>
      <div class="kpi-label">Ce Mois</div>
    </div>
    <div class="kpi-card">
      <div class="kpi-num" id="kpi-book">0</div>
      <div class="kpi-label">Réservations</div>
    </div>
    <div class="kpi-card">
      <div class="kpi-num" id="kpi-devis">0</div>
      <div class="kpi-label">Devis</div>
    </div>
  </div>

  <!-- Search & Filter Controls -->
  <div class="controls">
    <div class="search-row">
      <input type="text" id="searchInput" class="search-input" placeholder="🔍 Rechercher un nom, téléphone, ville, trajet, date..." oninput="applyFilters()">
    </div>

    <!-- Date Filters (Pills & Calendar Picker) -->
    <div class="filter-pills">
      <span class="group-label">📅 Période :</span>
      <button class="filter-pill active" onclick="setDateFilter('all', this)">Tous</button>
      <button class="filter-pill" onclick="setDateFilter('today', this)">Aujourd'hui</button>
      <button class="filter-pill" onclick="setDateFilter('yesterday', this)">Hier</button>
      <button class="filter-pill" onclick="setDateFilter('week', this)">Cette Semaine</button>
      <button class="filter-pill" onclick="setDateFilter('month', this)">Ce Mois</button>
      <button class="filter-pill" onclick="setDateFilter('year', this)">Cette Année</button>
      
      <div class="custom-date-wrap">
        <input type="date" id="dateFrom" class="date-input" title="Date début" onchange="setDateFilter('custom')">
        <span style="font-size:11px;color:#64748b;">à</span>
        <input type="date" id="dateTo" class="date-input" title="Date fin" onchange="setDateFilter('custom')">
      </div>
    </div>

    <!-- Type & Status Filters -->
    <div class="filter-pills">
      <span class="group-label">🏷️ Type :</span>
      <button class="filter-pill active" onclick="setTypeFilter('all', this)">Tous</button>
      <button class="filter-pill" onclick="setTypeFilter('Reservation', this)">Réservations</button>
      <button class="filter-pill" onclick="setTypeFilter('Devis', this)">Devis</button>
      
      <span class="group-label" style="margin-left:12px;">🚦 Statut :</span>
      <button class="filter-pill active" onclick="setStatusFilter('all', this)">Tous</button>
      <button class="filter-pill" onclick="setStatusFilter('Nouveau', this)">🟡 Nouveau</button>
      <button class="filter-pill" onclick="setStatusFilter('Contacté', this)">🔵 Contacté</button>
      <button class="filter-pill" onclick="setStatusFilter('Confirmé', this)">🟢 Confirmé</button>
      <button class="filter-pill" onclick="setStatusFilter('Terminé', this)">⚪ Terminé</button>
    </div>

    <!-- Grouping Selector -->
    <div class="grouping-bar">
      <div>
        <span class="group-label">📊 Regrouper par :</span>
        <button class="group-btn active" onclick="setGrouping('none', this)">Liste (Chronologique)</button>
        <button class="group-btn" onclick="setGrouping('day', this)">Par Jour</button>
        <button class="group-btn" onclick="setGrouping('week', this)">Par Semaine</button>
        <button class="group-btn" onclick="setGrouping('month', this)">Par Mois</button>
        <button class="group-btn" onclick="setGrouping('year', this)">Par Année</button>
      </div>
      <div style="font-size:11px;color:#64748b;" id="resultsCount">0 résultat</div>
    </div>
  </div>

  <!-- Results List -->
  <div class="container" id="resultsContainer">
    <!-- Populated by JavaScript -->
  </div>

  <div class="footer-note">
    Tableau de bord haute performance • Données temps réel • <?php echo htmlspecialchars($host); ?>
  </div>

  <!-- Raw Data Embedded for Instant Zero-Latency Filtering -->
  <script>
    const RAW_SUBMISSIONS = <?php echo json_encode($submissions, JSON_UNESCAPED_UNICODE); ?>;
    let currentPeriod = 'all';
    let currentType = 'all';
    let currentStatus = 'all';
    let currentGrouping = 'none';

    function parseDate(ts) {
      if (!ts) return new Date(0);
      // Format YYYY-MM-DD HH:MM:SS or DD/MM/YYYY
      if (ts.includes('-')) {
        return new Date(ts.replace(' ', 'T'));
      }
      var parts = ts.split(' ')[0].split('/');
      if (parts.length === 3) {
        return new Date(parts[2], parts[1] - 1, parts[0]);
      }
      return new Date(ts);
    }

    function isSameDay(d1, d2) {
      return d1.getFullYear() === d2.getFullYear() &&
             d1.getMonth() === d2.getMonth() &&
             d1.getDate() === d2.getDate();
    }

    function getWeekNumber(d) {
      var dCopy = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
      var dayNum = dCopy.getUTCDay() || 7;
      dCopy.setUTCDate(dCopy.getUTCDate() + 4 - dayNum);
      var yearStart = new Date(Date.UTC(dCopy.getUTCFullYear(),0,1));
      return Math.ceil((((dCopy - yearStart) / 86400000) + 1)/7);
    }

    function updateKPIs() {
      const now = new Date();
      let total = RAW_SUBMISSIONS.length;
      let todayCount = 0;
      let weekCount = 0;
      let monthCount = 0;
      let bookCount = 0;
      let devisCount = 0;

      const currentWeek = getWeekNumber(now);
      const currentYear = now.getFullYear();
      const currentMonth = now.getMonth();

      RAW_SUBMISSIONS.forEach(item => {
        const d = parseDate(item.timestamp);
        const type = (item.data['Type de demande'] || '').toLowerCase();
        
        if (type.includes('devis')) devisCount++;
        else bookCount++;

        if (isSameDay(d, now)) todayCount++;
        if (d.getFullYear() === currentYear && getWeekNumber(d) === currentWeek) weekCount++;
        if (d.getFullYear() === currentYear && d.getMonth() === currentMonth) monthCount++;
      });

      document.getElementById('kpi-total').textContent = total;
      document.getElementById('kpi-today').textContent = todayCount;
      document.getElementById('kpi-week').textContent = weekCount;
      document.getElementById('kpi-month').textContent = monthCount;
      document.getElementById('kpi-book').textContent = bookCount;
      document.getElementById('kpi-devis').textContent = devisCount;
    }

    function setDateFilter(period, btn) {
      currentPeriod = period;
      if (btn) {
        document.querySelectorAll('.filter-pills button').forEach(b => {
          if (['all','today','yesterday','week','month','year'].includes(b.getAttribute('onclick')?.split("'")[1])) {
            b.classList.remove('active');
          }
        });
        btn.classList.add('active');
      }
      applyFilters();
    }

    function setTypeFilter(type, btn) {
      currentType = type;
      if (btn) {
        btn.parentElement.querySelectorAll('button').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
      }
      applyFilters();
    }

    function setStatusFilter(status, btn) {
      currentStatus = status;
      if (btn) {
        btn.parentElement.querySelectorAll('button').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
      }
      applyFilters();
    }

    function setGrouping(grp, btn) {
      currentGrouping = grp;
      if (btn) {
        document.querySelectorAll('.group-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
      }
      applyFilters();
    }

    function updateItemStatus(id, newStatus, selectElem) {
      selectElem.className = 'status-select status-' + newStatus;
      const item = RAW_SUBMISSIONS.find(s => s.id === id);
      if (item) item.status = newStatus;

      fetch('admin.php?api=update_status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: id, status: newStatus })
      }).catch(err => console.error('Status save error:', err));
    }

    function copyToClipboard(id) {
      const item = RAW_SUBMISSIONS.find(s => s.id === id);
      if (!item) return;
      const d = item.data;
      let txt = `🚕 ${d['Type de demande'] || 'Réservation'} • ${d['Nom'] || 'Client'}\n`;
      txt += `📞 Tél : ${d['Telephone'] || d['Téléphone'] || ''}\n`;
      txt += `📍 Adresse départ : ${d['Adresse départ'] || d['Adresse depart'] || d['Depart'] || d['Départ'] || ''}\n`;
      txt += `🏙️ Ville : ${d['Ville'] || ''}\n`;
      txt += `🏁 Destination ville : ${d['Destination ville'] || d['Destination'] || ''}\n`;
      txt += `📅 Date : ${d['Date'] || ''} à ${d['Heure'] || ''}\n`;
      txt += `👥 Pax : ${d['Passagers'] || '1'} | 🚗 Véhicule : ${d['Vehicule'] || d['Véhicule'] || 'Standard'}\n`;
      if (d['Notes'] || d['Message']) txt += `📝 Notes : ${d['Notes'] || d['Message']}\n`;

      navigator.clipboard.writeText(txt).then(() => {
        alert('Détails copiés dans le presse-papier !');
      });
    }

    function applyFilters() {
      const q = document.getElementById('searchInput').value.toLowerCase().trim();
      const now = new Date();
      const currentYear = now.getFullYear();
      const currentMonth = now.getMonth();
      const currentWeek = getWeekNumber(now);

      const fromVal = document.getElementById('dateFrom').value;
      const toVal = document.getElementById('dateTo').value;
      const fromDate = fromVal ? new Date(fromVal + 'T00:00:00') : null;
      const toDate = toVal ? new Date(toVal + 'T23:59:59') : null;

      let filtered = RAW_SUBMISSIONS.filter(item => {
        const d = parseDate(item.timestamp);
        const data = item.data || {};
        const type = data['Type de demande'] || 'Réservation';
        const status = item.status || 'Nouveau';

        // 1. Text Search
        if (q) {
          const haystack = JSON.stringify(data).toLowerCase() + ' ' + (item.timestamp || '') + ' ' + status.toLowerCase();
          if (!haystack.includes(q)) return false;
        }

        // 2. Type Filter
        if (currentType !== 'all') {
          if (!type.toLowerCase().includes(currentType.toLowerCase())) return false;
        }

        // 3. Status Filter
        if (currentStatus !== 'all') {
          if (status !== currentStatus) return false;
        }

        // 4. Period Filter
        if (currentPeriod === 'today') {
          if (!isSameDay(d, now)) return false;
        } else if (currentPeriod === 'yesterday') {
          const yest = new Date(now);
          yest.setDate(now.getDate() - 1);
          if (!isSameDay(d, yest)) return false;
        } else if (currentPeriod === 'week') {
          if (d.getFullYear() !== currentYear || getWeekNumber(d) !== currentWeek) return false;
        } else if (currentPeriod === 'month') {
          if (d.getFullYear() !== currentYear || d.getMonth() !== currentMonth) return false;
        } else if (currentPeriod === 'year') {
          if (d.getFullYear() !== currentYear) return false;
        } else if (currentPeriod === 'custom') {
          if (fromDate && d < fromDate) return false;
          if (toDate && d > toDate) return false;
        }

        return true;
      });

      document.getElementById('resultsCount').textContent = filtered.length + ' résultat' + (filtered.length > 1 ? 's' : '');
      renderResults(filtered);
    }

    function getGroupKey(item, grouping) {
      const d = parseDate(item.timestamp);
      if (isNaN(d.getTime())) return 'Date inconnue';

      if (grouping === 'day') {
        const today = new Date();
        if (isSameDay(d, today)) return "Aujourd'hui (" + d.toLocaleDateString('fr-FR') + ")";
        const yest = new Date(today);
        yest.setDate(today.getDate() - 1);
        if (isSameDay(d, yest)) return "Hier (" + d.toLocaleDateString('fr-FR') + ")";
        return d.toLocaleDateString('fr-FR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
      } else if (grouping === 'week') {
        return "Semaine " + getWeekNumber(d) + " (" + d.getFullYear() + ")";
      } else if (grouping === 'month') {
        return d.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' }).toUpperCase();
      } else if (grouping === 'year') {
        return "Année " + d.getFullYear();
      }
      return 'Tous';
    }

    function renderResults(list) {
      const container = document.getElementById('resultsContainer');
      if (list.length === 0) {
        container.innerHTML = '<div class="empty-state"><h3>Aucune réservation ne correspond à vos critères de recherche.</h3><p style="margin-top:6px;font-size:13px;">Essayez de réinitialiser les filtres ou la période.</p></div>';
        return;
      }

      if (currentGrouping === 'none') {
        container.innerHTML = list.map(item => renderCard(item)).join('');
      } else {
        // Group items
        const groups = {};
        list.forEach(item => {
          const key = getGroupKey(item, currentGrouping);
          if (!groups[key]) groups[key] = [];
          groups[key].push(item);
        });

        let html = '';
        for (const [key, items] of Object.entries(groups)) {
          html += `<div class="group-header">
            <span>📅 ${key}</span>
            <span class="group-badge">${items.length} course${items.length > 1 ? 's' : ''}</span>
          </div>`;
          html += items.map(item => renderCard(item)).join('');
        }
        container.innerHTML = html;
      }
    }

    function renderCard(sub) {
      const d = sub.data || {};
      const ts = sub.timestamp || '';
      const type = d['Type de demande'] || 'Réservation';
      const nom = d['Nom'] || 'Client';
      const phone = d['Telephone'] || d['Téléphone'] || '';
      const cleanPhone = phone.replace(/[^0-9+]/g, '');
      const waPhone = phone.replace(/[^0-9]/g, '');
      const email = d['Email'] || '';
      const status = sub.status || 'Nouveau';
      const id = sub.id;

      let gridItems = '';
      const priorityKeys = ['Adresse départ', 'Adresse depart', 'Depart', 'Départ', 'Ville', 'Destination ville', 'Destination', 'Date', 'Heure', 'Passagers', 'Vehicule', 'Véhicule', 'Trajet', 'Type de course', 'Type de trajet', 'Vol', 'Message', 'Notes'];
      
      const seen = new Set(['Nom', 'Type de demande', 'Telephone', 'Téléphone', 'Email']);
      
      priorityKeys.forEach(k => {
        if (d[k] && !seen.has(k)) {
          seen.add(k);
          const isHl = ['Adresse départ', 'Adresse depart', 'Depart', 'Départ', 'Ville', 'Destination ville', 'Destination', 'Date', 'Heure'].includes(k);
          gridItems += `
            <div class="item ${isHl ? 'highlight' : ''}">
              <div class="item-label">${k}</div>
              <div class="item-val">${d[k]}</div>
            </div>`;
        }
      });

      for (const [k, v] of Object.entries(d)) {
        if (!seen.has(k) && !k.startsWith('_') && v) {
          gridItems += `
            <div class="item">
              <div class="item-label">${k}</div>
              <div class="item-val">${v}</div>
            </div>`;
        }
      }

      return `
        <div class="sub-card">
          <div class="sub-top">
            <div style="display:flex;align-items:center;gap:8px;">
              <span class="type-badge">${type}</span>
              <span class="sub-time">🕒 ${ts}</span>
            </div>
            <div>
              <select class="status-select status-${status}" onchange="updateItemStatus('${id}', this.value, this)">
                <option value="Nouveau" ${status === 'Nouveau' ? 'selected' : ''}>🟡 Nouveau</option>
                <option value="Contacté" ${status === 'Contacté' ? 'selected' : ''}>🔵 Contacté</option>
                <option value="Confirmé" ${status === 'Confirmé' ? 'selected' : ''}>🟢 Confirmé</option>
                <option value="Terminé" ${status === 'Terminé' ? 'selected' : ''}>⚪ Terminé</option>
                <option value="Annulé" ${status === 'Annulé' ? 'selected' : ''}>❌ Annulé</option>
              </select>
            </div>
          </div>

          <div class="sub-name">
            <span>👤 ${nom}</span>
          </div>

          <div class="actions">
            ${cleanPhone ? `<a href="tel:${cleanPhone}" class="btn btn-call">📞 Appeler ${phone}</a>` : ''}
            ${cleanPhone ? `<a href="https://wa.me/${waPhone}?text=${encodeURIComponent('Bonjour ' + nom + ', concernant votre demande avec Taxi...')}" target="_blank" class="btn btn-wa">💬 WhatsApp</a>` : ''}
            ${email ? `<a href="mailto:${email}" class="btn btn-mail">✉️ E-mail</a>` : ''}
            <button class="btn btn-copy" onclick="copyToClipboard('${id}')">📋 Copier résumé</button>
          </div>

          <div class="grid">
            ${gridItems}
          </div>
        </div>`;
    }

    function exportCSV() {
      let csv = 'ID,Date Reçue,Statut,Type,Nom,Téléphone,Email,Adresse Départ,Ville,Destination Ville,Date Course,Heure,Passagers,Véhicule,Notes\n';
      RAW_SUBMISSIONS.forEach(item => {
        const d = item.data || {};
        const row = [
          item.id,
          `"${item.timestamp || ''}"`,
          `"${item.status || 'Nouveau'}"`,
          `"${d['Type de demande'] || ''}"`,
          `"${d['Nom'] || ''}"`,
          `"${d['Telephone'] || d['Téléphone'] || ''}"`,
          `"${d['Email'] || ''}"`,
          `"${(d['Adresse départ'] || d['Adresse depart'] || d['Depart'] || d['Départ'] || '').replace(/"/g, '""')}"`,
          `"${(d['Ville'] || '').replace(/"/g, '""')}"`,
          `"${(d['Destination ville'] || d['Destination'] || '').replace(/"/g, '""')}"`,
          `"${d['Date'] || ''}"`,
          `"${d['Heure'] || ''}"`,
          `"${d['Passagers'] || ''}"`,
          `"${d['Vehicule'] || d['Véhicule'] || ''}"`,
          `"${(d['Notes'] || d['Message'] || '').replace(/"/g, '""')}"`
        ];
        csv += row.join(',') + '\n';
      });

      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `reservations_taxi_${new Date().toISOString().slice(0,10)}.csv`;
      link.click();
    }

    // Initialize Dashboard
    updateKPIs();
    applyFilters();

    // Auto-refresh every 20 seconds without losing filter state
    setInterval(() => {
      fetch(location.href)
        .then(r => r.text())
        .then(html => {
          const m = html.match(/const RAW_SUBMISSIONS = (\[[\s\S]*?\]);/);
          if (m && m[1]) {
            const fresh = JSON.parse(m[1]);
            if (fresh.length !== RAW_SUBMISSIONS.length) {
              RAW_SUBMISSIONS.length = 0;
              fresh.forEach(x => RAW_SUBMISSIONS.push(x));
              updateKPIs();
              applyFilters();
            }
          }
        }).catch(e => {});
    }, 20000);
  </script>
</body>
</html>
