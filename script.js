const LANYARD_ID = "562605372611887112";
async function loadLanyard(){
  try{
    const res = await fetch(`https://api.lanyard.rest/v1/users/${LANYARD_ID}`);
    const json = await res.json();
    if(!json.success) return;
    const d = json.data;
    const user = d.discord_user;
    if(user && user.avatar){
      const ext = user.avatar.startsWith("a_") ? "gif" : "png";
      const avatarUrl = `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.${ext}?size=256`;
      document.getElementById('lanyard-avatar').style.backgroundImage = `url('${avatarUrl}')`;
    }
    const decoEl = document.getElementById('lanyard-decoration');
    if(user && user.avatar_decoration_data && user.avatar_decoration_data.asset){
      const decoUrl = `https://cdn.discordapp.com/avatar-decoration-presets/${user.avatar_decoration_data.asset}.png?size=256&passthrough=true`;
      decoEl.style.backgroundImage = `url('${decoUrl}')`;
      decoEl.classList.add('show');
    } else {
      decoEl.classList.remove('show');
    }
    if(user){
      const displayName = user.global_name || user.username;
      document.getElementById('lanyard-name').textContent = displayName;
      document.getElementById('lanyard-handle').textContent = '@' + user.username;
      document.title = displayName;
    }
    const dot = document.getElementById('lanyard-status');
    dot.classList.remove('online','idle','dnd','offline');
    dot.classList.add(d.discord_status || 'offline');
    const activityEl = document.getElementById('lanyard-activity');
    if(d.listening_to_spotify && d.spotify){
      activityEl.textContent = `🎧 Listening to ${d.spotify.song} — ${d.spotify.artist}`;
      activityEl.classList.add('show');
    } else if(d.activities && d.activities.length){
      const act = d.activities.find(a => a.type !== 4) || d.activities[0];
      if(act && act.name){
        activityEl.textContent = `🎮 ${act.details ? act.name + ' — ' + act.details : act.name}`;
        activityEl.classList.add('show');
      }
    } else {
      activityEl.classList.remove('show');
    }
  } catch(err){
    console.warn('Lanyard fetch failed, using placeholder profile.', err);
  }
}
loadLanyard();
setInterval(loadLanyard, 20000);
const entry = document.getElementById('entry');
const content = document.getElementById('content');
const music = document.getElementById('bg-music');
const musicToggle = document.getElementById('music-toggle');
const nowPlaying = document.getElementById('now-playing');
entry.addEventListener('click', () => {
  entry.classList.add('hidden');
  content.classList.add('show');
  music.volume = 0.5;
  music.play().then(() => {
    nowPlaying.classList.add('show');
  }).catch(() => {
    musicToggle.classList.add('paused');
  });
});
musicToggle.addEventListener('click', () => {
  if (music.paused) {
    music.play();
    musicToggle.classList.remove('paused');
    nowPlaying.classList.add('show');
  } else {
    music.pause();
    musicToggle.classList.add('paused');
  }
});
const canvas = document.getElementById('bg-canvas');
const ctx = canvas.getContext('2d');
let w, h, particles;
function resize(){
  w = canvas.width = window.innerWidth;
  h = canvas.height = window.innerHeight;
}
window.addEventListener('resize', resize);
resize();
function initParticles(){
  particles = [];
  const count = Math.min(70, Math.floor((w*h)/18000));
  for(let i=0;i<count;i++){
    particles.push({
      x: Math.random()*w,
      y: Math.random()*h,
      r: Math.random()*1.6 + 0.4,
      vx: (Math.random()-0.5)*0.25,
      vy: (Math.random()-0.5)*0.25,
      hue: Math.random() > 0.5 ? 290 : 320
    });
  }
}
initParticles();
function tick(){
  ctx.clearRect(0,0,w,h);
  for(const p of particles){
    p.x += p.vx; p.y += p.vy;
    if(p.x < 0) p.x = w; if(p.x > w) p.x = 0;
    if(p.y < 0) p.y = h; if(p.y > h) p.y = 0;
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.r, 0, Math.PI*2);
    ctx.fillStyle = `hsla(${p.hue}, 100%, 75%, 0.55)`;
    ctx.shadowColor = `hsla(${p.hue}, 100%, 70%, 0.8)`;
    ctx.shadowBlur = 6;
    ctx.fill();
  }
  requestAnimationFrame(tick);
}
tick();
