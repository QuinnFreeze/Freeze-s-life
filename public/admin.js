'use strict';
(() => {
  const messages = {
    zh: {
      administration:'内容管理', visitSite:'浏览网站', welcome:'欢迎回来', loginLead:'登录后管理文章与网站内容。', username:'账号', password:'密码', signIn:'登录', privateAccess:'仅限已授权账号，不开放公开注册。', workspace:'工作空间', overview:'概览', articles:'文章管理', categories:'分类管理', images:'图片管理', settings:'网站设置', users:'后台账号', changePassword:'修改密码', signOut:'退出登录', confirmTitle:'请确认', cancel:'取消', confirm:'确认', saving:'正在保存，请稍候…', uploading:'图片正在上传，请稍候…', unpublishWarning:'这篇文章目前已发布，保存为草稿后会从公开网站下架。确定继续？', loading:'正在加载…', retry:'重试', failure:'操作失败，请稍后重试。', save:'保存', saved:'已保存', deleted:'已删除', uploaded:'图片已上传', copied:'链接已复制', admin:'管理员', editor:'编辑', overviewLead:'记录想法，整理内容，让小窝慢慢生长。', totalArticles:'文章总数', drafts:'草稿', published:'已发布', totalViews:'总阅读量', newArticle:'新建文章', recentArticles:'最近更新', allArticles:'所有文章', noArticles:'还没有文章，从记录第一个想法开始。', untitled:'未命名文章', title:'标题', status:'状态', updated:'更新时间', views:'阅读量', actions:'操作', edit:'编辑', delete:'删除', draft:'草稿', allStatus:'全部状态', searchArticles:'搜索文章标题或内容', search:'搜索', clear:'清除', previous:'上一页', next:'下一页', page:'页', total:'共', items:'条', category:'分类', uncategorized:'未分类', deleteArticle:'确定删除这篇文章？此操作无法撤销。', deleteCategory:'确定删除此分类？分类下的文章会保留。', deleteImage:'确定删除图片？已插入文章的图片链接可能失效。', deleteUser:'确定删除此后台账号？', backToArticles:'返回文章列表', editArticle:'编辑文章', writing:'文章内容', chinese:'中文', english:'English', articleTitle:'文章标题', excerpt:'摘要', excerptHint:'用于文章列表，可留空。', markdown:'Markdown 正文', preview:'实时预览', previewEmpty:'开始写作后，这里会显示预览。', previewError:'预览暂不可用，请稍后重试。', publishSettings:'发布设置', slug:'文章地址', slugHint:'使用小写英文字母、数字和连字符；留空可自动生成。', tags:'标签', tagsHint:'用中英文逗号分隔。', cover:'封面图片', coverHint:'上传图片，或粘贴 /uploads/ 路径或 HTTPS 图片链接。', uploadCover:'上传封面', publishedAt:'发布时间', publishedAtHint:'留空将在首次发布时使用当前时间。', saveDraft:'保存草稿', publish:'发布文章', savePublish:'保存并发布', publicView:'查看文章', unsaved:'有尚未保存的修改，确定离开？', unsavedLabel:'尚未保存', savedLabel:'所有修改已保存', image:'插入图片', link:'链接', bold:'加粗', italic:'斜体', code:'代码', list:'列表', quote:'引用', uploadNote:'支持 JPG、PNG、WebP、GIF，单张不超过 10 MB。', uploadImage:'上传图片', noImages:'还没有图片。上传后可在文章中插入。', copyLink:'复制链接', size:'大小', categoryLead:'用清晰的分类组织文章。', newCategory:'新建分类', categoryChinese:'中文名称', categoryEnglish:'英文名称', slugCategory:'分类标识', create:'创建', noCategories:'还没有分类。', articleCount:'文章数', settingsLead:'管理文章区的网站名称、描述与分页。', siteTitleZh:'中文网站名称', siteTitleEn:'英文网站名称', descriptionZh:'中文网站描述', descriptionEn:'英文网站描述', postsPerPage:'每页文章数', saveSettings:'保存设置', usersLead:'仅管理员可以创建和管理后台账号。', newUser:'创建后台账号', role:'角色', initialPassword:'初始密码', passwordHint:'至少 12 位，建议使用随机密码。', accountSettings:'账号设置', active:'启用账号', disabled:'已停用', newPassword:'新密码', resetPassword:'重置密码（留空则不修改）', updateAccount:'更新账号', currentAccount:'当前账号', passwordLead:'修改后，其他设备上的登录会失效。', oldPassword:'当前密码', confirmPassword:'确认新密码', passwordMismatch:'两次输入的新密码不一致。', passwordChanged:'密码已修改', forbidden:'当前账号无权访问此页面。', sessionExpired:'登录已过期，请重新登录。', loginError:'账号或密码错误，或尝试次数过多。', logoutConfirm:'确定退出登录？', emptyTitle:'请至少填写一种语言的文章标题和正文。', invalidDate:'请选择有效的发布时间。', imageTooLarge:'图片不能超过 10 MB。', leaveEditor:'离开编辑器', uploadFailed:'图片上传失败。', connectionError:'暂时无法连接后台服务。', reconnect:'重新连接', savedAsDraft:'已保存为草稿', publishedNotice:'文章已发布', imageCount:'图片数量', manageImages:'管理图片', scheduled:'待发布', scheduledNotice:'已保存，将于设定时间公开', available:'可用', noUsers:'没有可显示的账号。'
    },
    en: {
      administration:'Content administration', visitSite:'Visit site', welcome:'Welcome back', loginLead:'Sign in to manage your writing and site content.', username:'Username', password:'Password', signIn:'Sign in', privateAccess:'Authorized accounts only. Public registration is closed.', workspace:'WORKSPACE', overview:'Overview', articles:'Articles', categories:'Categories', images:'Images', settings:'Site settings', users:'Accounts', changePassword:'Change password', signOut:'Sign out', confirmTitle:'Please confirm', cancel:'Cancel', confirm:'Confirm', saving:'Saving, please wait…', uploading:'An image is uploading. Please wait…', unpublishWarning:'This article is published. Saving it as a draft will remove it from the public site. Continue?', loading:'Loading…', retry:'Retry', failure:'The action failed. Please try again.', save:'Save', saved:'Saved', deleted:'Deleted', uploaded:'Image uploaded', copied:'Link copied', admin:'Administrator', editor:'Editor', overviewLead:'Collect your thoughts and give your little nest room to grow.', totalArticles:'All articles', drafts:'Drafts', published:'Published', totalViews:'Total views', newArticle:'New article', recentArticles:'Recently updated', allArticles:'All articles', noArticles:'No articles yet. Start with your first thought.', untitled:'Untitled article', title:'Title', status:'Status', updated:'Updated', views:'Views', actions:'Actions', edit:'Edit', delete:'Delete', draft:'Draft', allStatus:'All statuses', searchArticles:'Search article titles or content', search:'Search', clear:'Clear', previous:'Previous', next:'Next', page:'Page', total:'Total', items:'items', category:'Category', uncategorized:'Uncategorized', deleteArticle:'Delete this article? This cannot be undone.', deleteCategory:'Delete this category? Its articles will be kept.', deleteImage:'Delete this image? Existing article image links may stop working.', deleteUser:'Delete this administrator account?', backToArticles:'Back to articles', editArticle:'Edit article', writing:'Article content', chinese:'中文', english:'English', articleTitle:'Article title', excerpt:'Excerpt', excerptHint:'Shown in article listings. Optional.', markdown:'Markdown content', preview:'Live preview', previewEmpty:'Start writing to see your preview here.', previewError:'Preview is temporarily unavailable. Please try again.', publishSettings:'Publishing', slug:'Article URL', slugHint:'Use lowercase letters, numbers and hyphens. Leave blank to generate a URL.', tags:'Tags', tagsHint:'Separate tags with commas.', cover:'Cover image', coverHint:'Upload an image, or use an /uploads/ path or HTTPS image URL.', uploadCover:'Upload cover', publishedAt:'Publication time', publishedAtHint:'Leave blank to use the current time on first publication.', saveDraft:'Save draft', publish:'Publish article', savePublish:'Save and publish', publicView:'View article', unsaved:'You have unsaved changes. Leave this page?', unsavedLabel:'Unsaved changes', savedLabel:'All changes saved', image:'Insert image', link:'Link', bold:'Bold', italic:'Italic', code:'Code', list:'List', quote:'Quote', uploadNote:'JPG, PNG, WebP or GIF. Maximum 10 MB per image.', uploadImage:'Upload image', noImages:'No images yet. Upload one to insert it into an article.', copyLink:'Copy link', size:'Size', categoryLead:'Give your writing a clear place to belong.', newCategory:'New category', categoryChinese:'Chinese name', categoryEnglish:'English name', slugCategory:'Category slug', create:'Create', noCategories:'No categories yet.', articleCount:'Articles', settingsLead:'Manage the article section’s site title, description and pagination.', siteTitleZh:'Chinese site title', siteTitleEn:'English site title', descriptionZh:'Chinese description', descriptionEn:'English description', postsPerPage:'Articles per page', saveSettings:'Save settings', usersLead:'Only administrators can create and manage accounts.', newUser:'Create account', role:'Role', initialPassword:'Initial password', passwordHint:'At least 12 characters. A random password is recommended.', accountSettings:'Account settings', active:'Account enabled', disabled:'Disabled', newPassword:'New password', resetPassword:'Reset password (leave blank to keep it)', updateAccount:'Update account', currentAccount:'Current account', passwordLead:'Changing your password signs out your other devices.', oldPassword:'Current password', confirmPassword:'Confirm new password', passwordMismatch:'The new passwords do not match.', passwordChanged:'Password changed', forbidden:'Your account cannot access this page.', sessionExpired:'Your session expired. Please sign in again.', loginError:'Incorrect credentials, or too many sign-in attempts.', logoutConfirm:'Sign out of your account?', emptyTitle:'Add a title and content in at least one language.', invalidDate:'Choose a valid publication time.', imageTooLarge:'Images must be 10 MB or smaller.', leaveEditor:'Leave editor', uploadFailed:'Image upload failed.', connectionError:'The administration service is temporarily unavailable.', reconnect:'Reconnect', savedAsDraft:'Saved as draft', publishedNotice:'Article published', imageCount:'Images', manageImages:'Manage images', scheduled:'Scheduled', scheduledNotice:'Saved; the article will become public at the selected time', available:'Available', noUsers:'No accounts to display.'
    }
  };
  const $ = (selector,root=document) => root.querySelector(selector);
  const $$ = (selector,root=document) => [...root.querySelectorAll(selector)];
  const esc = value => String(value ?? '').replace(/[&<>"']/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
  let lang='zh';
  try { lang=new URL(location.href).searchParams.get('lang') || localStorage.getItem('homepage-language') || 'zh'; } catch (_) {}
  if (!['zh','en'].includes(lang)) lang='zh';
  const t=key=>messages[lang][key]||key;
  let editorSaving=false, editorUploads=0, previewController=null, authRefreshPromise=null;
  let user=null, csrf='', dirty=false, article=null, articleLang='zh', previewTimer, previewSequence=0, noticeTimer, routeSequence=0, lastHash='', ignoreHash=false, listQuery='', listStatus='', listPage=1;
  const main=$('#admin-content');
  const field=(label,name,value='',extra='')=>`<label><span>${t(label)}</span><input name="${name}" value="${esc(value)}" ${extra}></label>`;
  const button=(key,action,extra='')=>`<button type="button" class="admin-button" data-action="${action}" ${extra}>${t(key)}</button>`;
  function dateText(value) { if(!value) return '—'; const d=new Date(value); return Number.isNaN(d.getTime())?'—':d.toLocaleDateString(lang==='zh'?'zh-CN':'en-US',{year:'numeric',month:'short',day:'numeric'}); }
  function toLocal(value) { if(!value)return ''; const d=new Date(value);if(Number.isNaN(d.getTime())) return '';return new Date(d.getTime()-d.getTimezoneOffset()*60000).toISOString().slice(0,16); }
  function notice(message,error=false) { clearTimeout(noticeTimer); const el=$('#admin-notice');el.textContent=message;el.classList.toggle('error',error);el.hidden=false;noticeTimer=setTimeout(()=>el.hidden=true,5500); }
  function applyLanguage() {
    document.documentElement.lang=lang==='zh'?'zh-CN':'en';document.title=`${t('administration')} · Freeze’s Nest`;
    $$('[data-t]').forEach(el=>el.textContent=t(el.dataset.t));
    $('#admin-language').textContent=lang==='zh'?'EN':'中文';
    $('#admin-language').ariaLabel=lang==='zh'?'Switch to English':'切换到中文';
    if(user) $('#admin-identity').textContent=`${user.username} · ${t(user.role)}`;
  }
  async function api(path,{method='GET',body,signal}={}) {
    const requestUser=user;
    const headers={Accept:'application/json'}; const options={method,credentials:'same-origin',headers,signal};
    if(method!=='GET')headers['X-CSRF-Token']=csrf;
    if(body instanceof FormData)options.body=body;
    else if(body!==undefined){headers['Content-Type']='application/json';options.body=JSON.stringify(body);}
    let response;
    try {response=await fetch(path,options);} catch(e){throw new Error(t('connectionError'));}
    let data;try {data=await response.json();}catch(_){data={};}
    if(data.csrf_token&&user===requestUser)csrf=data.csrf_token;
    if(!response.ok){
      if(response.status===401&&path!=='/api/auth/login'&&path!=='/api/auth/me'&&user===requestUser) {csrf='';showLogin();try {await refreshAuth();}catch(_){}}
      const error=typeof data.error==='string'?data.error:(data.error?.message||data.message);
      throw new Error(error||(response.status===401?t('loginError'):response.status===403?t('forbidden'):t('failure')));
    }
    return data;
  }
  function refreshAuth() {
    if(!authRefreshPromise)authRefreshPromise=api('/api/auth/me').finally(()=>{authRefreshPromise=null;});
    return authRefreshPromise;
  }
  async function confirmAction(message) {
    const dialog=$('#admin-confirm');if(dialog.open)return false;
    $('#confirm-message').textContent=message;
    dialog.returnValue='cancel';dialog.showModal();
    return new Promise(resolve=>dialog.addEventListener('close',()=>resolve(dialog.returnValue==='confirm'),{once:true}));
  }
  function setDirty(value) { dirty=value;const el=$('#editor-save-state');if(el)el.textContent=t(dirty?'unsavedLabel':'savedLabel'); }
  function showLogin() {
    routeSequence++;clearTimeout(previewTimer);previewSequence++;previewController?.abort();
    user=null;article=null;dirty=false;editorSaving=false;main.replaceChildren();$('#admin-identity').textContent='';
    $('#admin-loading').hidden=true;$('#admin-workspace').hidden=true;$('#admin-login').hidden=false;$('#login-form button').disabled=false;
  }
  function showWorkspace() { $('#admin-loading').hidden=true;$('#admin-login').hidden=true;$('#admin-workspace').hidden=false;$$('[data-admin-only]').forEach(el=>el.hidden=user.role!=='admin');applyLanguage();renderRoute(); }
  function pageHeading(title,subtitle='',actions='') { return `<header class="admin-page-heading"><div><h1>${t(title)}</h1>${subtitle?`<p class="admin-subtitle">${t(subtitle)}</p>`:''}</div><div class="admin-actions">${actions}</div></header>`; }
  function empty(key,action='') {return `<div class="admin-empty"><p>${t(key)}</p>${action}</div>`;}
  async function navigate(route) {if(editorSaving){notice(t('saving'));return;}if(dirty && !(await confirmAction(t('unsaved'))))return;setDirty(false);if(location.hash===`#${route}`)renderRoute();else location.hash=route;}
  async function renderRoute() {
    if(!user)return;let route=location.hash.slice(1)||'dashboard';if(editorSaving&&route!==lastHash){ignoreHash=true;location.hash=lastHash;notice(t('saving'));return;}const ticket=++routeSequence;
    if(dirty && route!==lastHash){const leave=await confirmAction(t('unsaved'));if(ticket!==routeSequence)return;if(!leave){ignoreHash=true;location.hash=lastHash;return;}setDirty(false);}
    if(ticket!==routeSequence)return;
    lastHash=route;clearTimeout(previewTimer);previewSequence++;previewController?.abort();
    const section=route.split('/')[0];$$('#admin-nav a').forEach(el=>el.getAttribute('data-route')===(section==='editor'?'articles':section)?el.setAttribute('aria-current','page'):el.removeAttribute('aria-current'));
    main.innerHTML=`<div class="card-base admin-empty" role="status">${t('loading')}</div>`;
    try {
      if(['settings','users'].includes(section)&&user.role!=='admin')throw new Error(t('forbidden'));
      let html, pendingEditor;
      if(section==='dashboard')html=await dashboard();
      else if(section==='articles')html=await articleList();
      else if(section==='editor'){pendingEditor=await editor(route.split('/')[1]);html=pendingEditor.html;}
      else if(section==='categories')html=await categories();
      else if(section==='images')html=await images();
      else if(section==='settings')html=await settings();
      else if(section==='users')html=await users();
      else if(section==='password')html=password();
      else {location.hash='dashboard';return;}
      if(ticket!==routeSequence)return;
      if(pendingEditor){article=pendingEditor.article;articleLang=pendingEditor.articleLang;setDirty(false);}
      main.innerHTML=html;
      if(section==='editor')updatePreview();
    }catch(e){if(ticket===routeSequence)main.innerHTML=`<section class="card-base admin-panel"><p class="admin-error" role="alert">${esc(e.message)}</p><div class="admin-actions">${button('retry','retry')}</div></section>`;}
  }
  function articleRows(items) {
    return items.map(a=>`<tr><td><a class="admin-title-link" href="#editor/${a.id}" data-route="editor/${a.id}">${esc(a[`title_${lang}`]||a.title_zh||a.title_en||a.title||t('untitled'))}</a><span class="admin-note">/${esc(a.slug)}</span></td><td><span class="admin-badge ${a.status==='published'?'published':''}">${t(a.status==='published'?(a.published_at&&new Date(a.published_at)>new Date()?'scheduled':'published'):'draft')}</span></td><td class="optional">${dateText(a.updated_at)}</td><td class="optional">${Number(a.views)||0}</td><td><div class="admin-row-actions"><a class="admin-button small" href="#editor/${a.id}" data-route="editor/${a.id}">${t('edit')}</a><button class="admin-button small danger" type="button" data-action="delete-article" data-id="${a.id}">${t('delete')}</button></div></td></tr>`).join('');
  }
  function articleTable(items) {return `<div class="admin-table-wrap"><table class="admin-table"><thead><tr><th>${t('title')}</th><th>${t('status')}</th><th class="optional">${t('updated')}</th><th class="optional">${t('views')}</th><th>${t('actions')}</th></tr></thead><tbody>${articleRows(items)}</tbody></table></div>`;}
  async function dashboard() {
    const [s,a]=await Promise.all([api('/api/admin/stats'),api('/api/admin/articles?per_page=5')]);
    return pageHeading('overview','overviewLead',`<a class="admin-button primary" href="#editor/new" data-route="editor/new">＋ ${t('newArticle')}</a>`)+`<div class="admin-stats">${[['totalArticles',s.articles],['drafts',s.drafts],['published',s.published],['totalViews',s.views]].map(([key,value])=>`<section class="card-base admin-stat"><span class="admin-note">${t(key)}</span><strong>${Number(value)||0}</strong></section>`).join('')}</div><section class="card-base admin-panel"><div class="admin-page-heading"><h2>${t('recentArticles')}</h2><a class="admin-text-link" href="#articles" data-route="articles">${t('allArticles')} →</a></div>${a.items?.length?articleTable(a.items):empty('noArticles',`<a class="admin-button" href="#editor/new" data-route="editor/new">${t('newArticle')}</a>`)}</section>`;
  }
  async function articleList() {
    const q=new URLSearchParams({q:listQuery,status:listStatus,page:listPage,per_page:12});const data=await api(`/api/admin/articles?${q}`);
    return pageHeading('articles','',`<a class="admin-button primary" href="#editor/new" data-route="editor/new">＋ ${t('newArticle')}</a>`)+`<section class="card-base admin-panel"><form id="article-search" class="admin-toolbar"><label class="admin-field admin-search"><span class="admin-note">${t('search')}</span><input name="q" type="search" placeholder="${t('searchArticles')}" aria-label="${t('searchArticles')}" value="${esc(listQuery)}"></label><label class="admin-field"><span class="admin-note">${t('status')}</span><select name="status"><option value="">${t('allStatus')}</option><option value="draft" ${listStatus==='draft'?'selected':''}>${t('drafts')}</option><option value="published" ${listStatus==='published'?'selected':''}>${t('published')}</option></select></label><button class="admin-button" type="submit">${t('search')}</button>${listQuery||listStatus?button('clear','clear-search'):''}</form>${data.items?.length?articleTable(data.items):empty('noArticles')}<div class="admin-pagination"><span class="admin-note">${t('total')} ${Number(data.total)||0} ${t('items')} · ${t('page')} ${Number(data.page)||1} / ${Math.max(Number(data.pages)||1,1)}</span><div class="admin-actions"><button class="admin-button small" data-action="page-prev" ${listPage<=1?'disabled':''}>${t('previous')}</button><button class="admin-button small" data-action="page-next" ${listPage>=Math.max(data.pages||1,1)?'disabled':''}>${t('next')}</button></div></div></section>`;
  }
  async function editor(id) {
    const data=await api('/api/admin/categories');
    let article=id&&id!=='new'?await api(`/api/admin/articles/${encodeURIComponent(id)}`):{slug:'',title_zh:'',title_en:'',content_zh:'',content_en:'',excerpt_zh:'',excerpt_en:'',cover_url:'',tags:[],status:'draft',category_id:null,published_at:null};
    if(article.article)article=article.article;
    const articleLang=article[`title_${lang}`]||!article.id?lang:(article.title_zh?'zh':'en');
    const toolbar=`<div class="admin-markdown-toolbar" aria-label="Markdown">${[['bold','B'],['italic','I'],['link','↗'],['code','&lt;/&gt;'],['list','•'],['quote','❞'],['image',t('image')]].map(([action,label])=>`<button type="button" data-action="markdown-${action}" title="${t(action)}" aria-label="${t(action)}">${label}</button>`).join('')}</div>`;
    const html=pageHeading(article.id?'editArticle':'newArticle','',`<a href="#articles" data-route="articles" class="admin-text-link">← ${t('backToArticles')}</a>`)+`<form id="article-editor"><div class="admin-editor-grid"><div class="admin-editor-main"><section class="card-base admin-panel"><h2>${t('writing')}</h2><div class="admin-tabs" role="tablist" aria-label="${t('writing')}"><button type="button" role="tab" id="editor-tab-zh" aria-controls="editor-panel-zh" data-action="content-language" data-language="zh" aria-selected="${articleLang==='zh'}">中文</button><button type="button" role="tab" id="editor-tab-en" aria-controls="editor-panel-en" data-action="content-language" data-language="en" aria-selected="${articleLang==='en'}">English</button></div>${['zh','en'].map(l=>`<div class="admin-form" role="tabpanel" id="editor-panel-${l}" aria-labelledby="editor-tab-${l}" data-content-language="${l}" ${l!==articleLang?'hidden':''}><label><span>${t('articleTitle')} · ${l==='zh'?'中文':'English'}</span><input name="title_${l}" value="${esc(article[`title_${l}`])}" maxlength="250"></label><label><span>${t('excerpt')}</span><textarea name="excerpt_${l}" rows="2" maxlength="1000" placeholder="${t('excerptHint')}">${esc(article[`excerpt_${l}`])}</textarea></label><div><label class="admin-field" for="content-${l}"><span>${t('markdown')}</span></label>${toolbar}<textarea id="content-${l}" class="admin-markdown-input" name="content_${l}" spellcheck="false" aria-label="${t('markdown')} ${l==='zh'?'中文':'English'}">${esc(article[`content_${l}`])}</textarea></div></div>`).join('')}<section class="admin-preview" aria-label="${t('preview')}"><h2>${t('preview')}</h2><div id="markdown-preview" class="cms-markdown"></div></section></section></div><aside class="admin-editor-aside"><section class="card-base admin-panel"><h2>${t('publishSettings')}</h2><div class="admin-form">${field('slug','slug',article.slug,'maxlength="120" pattern="[a-z0-9]+(-[a-z0-9]+)*"')}<p class="admin-note">${t('slugHint')}</p><label><span>${t('category')}</span><select name="category_id"><option value="">${t('uncategorized')}</option>${(data.items||[]).map(c=>`<option value="${c.id}" ${Number(c.id)===Number(article.category_id)?'selected':''}>${esc(c[`name_${lang}`]||c.name_zh||c.name_en||c.slug)}</option>`).join('')}</select></label>${field('tags','tags',(article.tags||[]).join(', '),'maxlength="1000"')}<p class="admin-note">${t('tagsHint')}</p>${field('cover','cover_url',article.cover_url,'type="text" maxlength="2000"')}<label class="admin-button admin-upload-label">${t('uploadCover')}<input type="file" id="cover-upload" accept="image/jpeg,image/png,image/webp,image/gif"></label><p class="admin-note">${t('coverHint')}</p><img id="editor-cover-preview" class="admin-cover" ${safeImage(article.cover_url)?`src="${esc(safeImage(article.cover_url))}"`:'hidden'} alt="${t('cover')}">${field('publishedAt','published_at',toLocal(article.published_at),'type="datetime-local"')}<p class="admin-note">${t('publishedAtHint')}</p></div></section><section class="card-base admin-panel"><div class="admin-form"><button class="admin-button" type="submit" name="save_action" value="draft">${t('saveDraft')}</button><button class="admin-button primary" type="submit" name="save_action" value="published">${t(article.id?'savePublish':'publish')}</button><span class="admin-note" id="editor-save-state" role="status">${t('savedLabel')}</span>${article.id&&article.status==='published'?`<a class="admin-text-link" href="/articles/${encodeURIComponent(article.slug)}?lang=${articleLang}" target="_blank" rel="noopener">${t('publicView')} ↗</a>`:''}</div></section></aside></div><input id="markdown-image-upload" type="file" accept="image/jpeg,image/png,image/webp,image/gif" hidden></form>`;
    return {html,article,articleLang};
  }
  function updateCover() {const el=$('#editor-cover-preview');const input=$('[name="cover_url"]');if(!el||!input)return;const url=safeImage(input.value);el.hidden=!url;if(url)el.src=url;else el.removeAttribute('src');}
  function safeImage(value){const str=String(value||'');return str.startsWith('/uploads/')||/^https:\/\//i.test(str)?str:'';}
  async function updatePreview() {
    clearTimeout(previewTimer);const seq=++previewSequence;previewController?.abort();previewController=new AbortController();const area=$(`[name="content_${articleLang}"]`);const el=$('#markdown-preview');if(!area||!el)return;
    if(!area.value.trim()){el.innerHTML=`<p class="admin-note">${t('previewEmpty')}</p>`;return;}
    try {const result=await api('/api/admin/preview',{method:'POST',body:{content:area.value},signal:previewController.signal});if(seq===previewSequence&&$('#markdown-preview'))$('#markdown-preview').innerHTML=result.html||'';}catch(e){if(seq===previewSequence&&$('#markdown-preview'))$('#markdown-preview').textContent=t('previewError');}
  }
  function collectArticle(status) {
    const form=$('#article-editor');const data=new FormData(form);const result={status};
    for(const name of ['slug','title_zh','title_en','content_zh','content_en','excerpt_zh','excerpt_en','cover_url'])result[name]=String(data.get(name)||'');
    result.category_id=data.get('category_id')?Number(data.get('category_id')):null;result.tags=String(data.get('tags')||'').split(/[,，]/).map(s=>s.trim()).filter(Boolean);
    result.published_at=data.get('published_at')?new Date(data.get('published_at')).toISOString():null;
    if(article?.updated_at)result.updated_at=article.updated_at;
    if(article?.version!==undefined)result.version=article.version;
    return result;
  }
  function insertMarkdown(before,after='',placeholder='',target=null) {const textarea=target||$(`[name="content_${articleLang}"]`);if(!textarea)return;const start=textarea.selectionStart,end=textarea.selectionEnd,text=textarea.value.slice(start,end)||placeholder;textarea.setRangeText(before+text+after,start,end,'end');textarea.focus();setDirty(true);if(textarea.name===`content_${articleLang}`){clearTimeout(previewTimer);previewTimer=setTimeout(updatePreview,250);}}
  async function upload(file) {if(!file)return null;if(file.size>10*1024*1024)throw new Error(t('imageTooLarge'));const form=new FormData();form.append('file',file);const result=await api('/api/admin/images',{method:'POST',body:form});return result.image||result;}
  async function categories() {
    const result=await api('/api/admin/categories');return pageHeading('categories','categoryLead')+`<section class="card-base admin-panel"><h2>${t('newCategory')}</h2><form id="category-create" class="admin-form admin-form-grid">${field('categoryChinese','name_zh','','maxlength="100"')}${field('categoryEnglish','name_en','','maxlength="100"')}${field('slugCategory','slug','','required pattern="[a-z0-9]+(-[a-z0-9]+)*" maxlength="120"')}<div class="admin-actions"><button type="submit" class="admin-button primary">${t('create')}</button></div></form></section><section class="card-base admin-panel">${result.items?.length?`<div class="admin-table-wrap"><table class="admin-table"><thead><tr><th>${t('category')}</th><th>${t('articleCount')}</th><th>${t('actions')}</th></tr></thead><tbody>${result.items.map(c=>`<tr><td><strong>${esc(c.name_zh||c.name_en)}</strong><p class="admin-note">${esc(c.name_en||'')} · ${esc(c.slug)}</p><details class="admin-details"><summary>${t('edit')}</summary><form class="admin-form admin-account-edit" data-form="category-edit" data-id="${c.id}">${field('categoryChinese','name_zh',c.name_zh,'maxlength="100"')}${field('categoryEnglish','name_en',c.name_en,'maxlength="100"')}${field('slugCategory','slug',c.slug,'required maxlength="120"')}<button type="submit" class="admin-button small">${t('save')}</button></form></details></td><td>${Number(c.count)||0}</td><td><button class="admin-button small danger" data-action="delete-category" data-id="${c.id}">${t('delete')}</button></td></tr>`).join('')}</tbody></table></div>`:empty('noCategories')}</section>`;
  }
  async function images() {
    const result=await api('/api/admin/images');return pageHeading('images','uploadNote',`<label class="admin-button primary admin-upload-label">＋ ${t('uploadImage')}<input id="library-upload" type="file" accept="image/jpeg,image/png,image/webp,image/gif" multiple></label>`)+`<section class="card-base admin-panel">${result.items?.length?`<div class="admin-image-grid">${result.items.map(i=>`<article class="admin-image-card"><img loading="lazy" src="${esc(safeImage(i.url))}" alt="${esc(i.filename)}"><div class="admin-image-card-content"><p title="${esc(i.filename)}">${esc(i.filename)}</p><span class="admin-note">${Number(i.width)||0} × ${Number(i.height)||0} · ${((Number(i.size)||0)/1024).toFixed(1)} KB</span><div class="admin-actions"><button class="admin-button small" data-action="copy-image" data-url="${esc(i.url)}">${t('copyLink')}</button><button class="admin-button small danger" data-action="delete-image" data-id="${i.id}">${t('delete')}</button></div></div></article>`).join('')}</div>`:empty('noImages')}</section>`;
  }
  async function settings() {const s=await api('/api/admin/settings');return pageHeading('settings','settingsLead')+`<section class="card-base admin-panel"><form id="settings-form" class="admin-form admin-form-grid">${field('siteTitleZh','site_title_zh',s.site_title_zh,'required maxlength="150"')}${field('siteTitleEn','site_title_en',s.site_title_en,'required maxlength="150"')}<label><span>${t('descriptionZh')}</span><textarea name="description_zh" maxlength="300" rows="3">${esc(s.description_zh)}</textarea></label><label><span>${t('descriptionEn')}</span><textarea name="description_en" maxlength="300" rows="3">${esc(s.description_en)}</textarea></label>${field('postsPerPage','posts_per_page',s.posts_per_page||10,'type="number" min="1" max="50" required')}<div class="admin-actions full"><button type="submit" class="admin-button primary">${t('saveSettings')}</button></div></form></section>`;}
  async function users() {
    const result=await api('/api/admin/users');const roles=value=>`<option value="editor" ${value==='editor'?'selected':''}>${t('editor')}</option><option value="admin" ${value==='admin'?'selected':''}>${t('admin')}</option>`;
    return pageHeading('users','usersLead')+`<section class="card-base admin-panel"><h2>${t('newUser')}</h2><form id="user-create" class="admin-form admin-form-grid">${field('username','username','','required autocomplete="off" minlength="3" maxlength="64" pattern="[a-zA-Z0-9_.\\-]+"')}${field('initialPassword','password','','required type="password" autocomplete="new-password" minlength="12" maxlength="128"')}<label><span>${t('role')}</span><select name="role">${roles('editor')}</select></label><p class="admin-note">${t('passwordHint')}</p><div class="admin-actions full"><button class="admin-button primary" type="submit">${t('create')}</button></div></form></section><section class="card-base admin-panel">${result.items?.length?`<div class="admin-table-wrap"><table class="admin-table"><thead><tr><th>${t('username')}</th><th>${t('role')}</th><th>${t('actions')}</th></tr></thead><tbody>${result.items.map(u=>`<tr><td><strong>${esc(u.username)}</strong>${Number(u.id)===Number(user.id)?`<p class="admin-note">${t('currentAccount')}</p>`:''}${u.active===false||u.active===0?`<span class="admin-badge">${t('disabled')}</span>`:''}<details class="admin-details"><summary>${t('accountSettings')}</summary><form class="admin-form admin-account-edit" data-form="user-edit" data-id="${u.id}"><label><span>${t('role')}</span><select name="role">${roles(u.role)}</select></label>${field('resetPassword','password','','type="password" autocomplete="new-password" minlength="12" maxlength="128"')}<label class="admin-inline-check"><input name="active" type="checkbox" ${u.active!==false&&u.active!==0?'checked':''} ${Number(u.id)===Number(user.id)?'disabled':''}><span>${t('active')}</span></label><button class="admin-button small" type="submit">${t('updateAccount')}</button></form></details></td><td>${t(u.role)}</td><td>${Number(u.id)!==Number(user.id)?`<button class="admin-button small danger" data-action="delete-user" data-id="${u.id}">${t('delete')}</button>`:'—'}</td></tr>`).join('')}</tbody></table></div>`:empty('noUsers')}</section>`;
  }
  function password() {return pageHeading('changePassword','passwordLead')+`<section class="card-base admin-panel"><form id="password-form" class="admin-form">${field('oldPassword','old_password','','required type="password" autocomplete="current-password" maxlength="128"')}${field('newPassword','password','','required type="password" autocomplete="new-password" minlength="12" maxlength="128"')}${field('confirmPassword','confirmation','','required type="password" autocomplete="new-password" minlength="12" maxlength="128"')}<p class="admin-note">${t('passwordHint')}</p><div class="admin-actions"><button type="submit" class="admin-button primary">${t('changePassword')}</button></div></form></section>`;}
  document.addEventListener('click',async event=>{
    const routeLink=event.target.closest('[data-route]');if(routeLink){event.preventDefault();await navigate(routeLink.dataset.route);return;}
    const el=event.target.closest('[data-action]');if(!el)return;const action=el.dataset.action;
    try{
      if(action==='retry')return renderRoute();
      if(action==='clear-search'){listQuery='';listStatus='';listPage=1;return renderRoute();}
      if(action==='page-prev'||action==='page-next'){listPage+=action==='page-next'?1:-1;return renderRoute();}
      if(action==='content-language') {articleLang=el.dataset.language;$$('[data-content-language]').forEach(panel=>panel.hidden=panel.dataset.contentLanguage!==articleLang);$$('[data-action="content-language"]').forEach(b=>b.setAttribute('aria-selected',String(b===el)));updatePreview();return;}
      if(action.startsWith('markdown-')) {const format=action.slice(9);if(format==='image')return $('#markdown-image-upload').click();const formats={bold:['**','**',t('bold')],italic:['_','_',t('italic')],link:['[','](https://)',t('link')],code:['`','`',t('code')],list:['\n- ','',t('list')],quote:['\n> ','',t('quote')]};if(formats[format])insertMarkdown(...formats[format]);return;}
      if(action==='copy-image'){const url=new URL(el.dataset.url,location.origin).href;try{await navigator.clipboard.writeText(url);notice(t('copied'));}catch(_){notice(url);}return;}
      const deleteMap={'delete-article':['deleteArticle','articles'],'delete-category':['deleteCategory','categories'],'delete-image':['deleteImage','images'],'delete-user':['deleteUser','users']};
      if(deleteMap[action]) {const [key,resource]=deleteMap[action];if(!await confirmAction(t(key)))return;el.disabled=true;await api(`/api/admin/${resource}/${el.dataset.id}`,{method:'DELETE'});notice(t('deleted'));return renderRoute();}
    }catch(e){notice(e.message,true);el.disabled=false;}
  });
  document.addEventListener('submit',async event=>{
    const form=event.target;if(form.closest('#admin-confirm'))return;if(!form.closest('.admin-shell'))return;event.preventDefault();
    if(form.dataset.submitting)return;form.dataset.submitting='true';
    const submitter=event.submitter;const buttons=$$('button[type="submit"]',form);buttons.forEach(b=>b.disabled=true);
    try{
      const data=Object.fromEntries(new FormData(form));
      if(form.id==='login-form') {$('#login-error').hidden=true;if(!csrf)await refreshAuth();const result=await api('/api/auth/login',{method:'POST',body:data});user=result.user;if(!user){const me=await api('/api/auth/me');user=me.user;}if(!user)throw new Error(t('loginError'));form.reset();showWorkspace();}
      else if(form.id==='article-search'){listQuery=data.q||'';listStatus=data.status||'';listPage=1;renderRoute();}
      else if(form.id==='article-editor') {
        if(editorUploads)throw new Error(t('uploading'));
        const payload=collectArticle(submitter?.value||article.status||'draft');
        if(payload.status==='published'&&!((payload.title_zh.trim()&&payload.content_zh.trim())||(payload.title_en.trim()&&payload.content_en.trim())))throw new Error(t('emptyTitle'));
        if(article.status==='published'&&payload.status==='draft'&&!await confirmAction(t('unpublishWarning')))return;
        editorSaving=true;
        const controls=[...form.elements].map(el=>[el,el.disabled]);controls.forEach(([el])=>el.disabled=true);
        try {
          const saved=await api(article.id?`/api/admin/articles/${article.id}`:'/api/admin/articles',{method:article.id?'PUT':'POST',body:payload});
          setDirty(false);const result=saved.article||saved;
          notice(t(payload.status==='draft'?'savedAsDraft':payload.published_at&&new Date(payload.published_at)>new Date()?'scheduledNotice':'publishedNotice'));
          const id=result.id||article.id;editorSaving=false;
          if(id)await navigate(`editor/${id}`);else await navigate('articles');
        } finally {editorSaving=false;controls.forEach(([el,disabled])=>el.disabled=disabled);}
      }
      else if(form.id==='category-create'||form.dataset.form==='category-edit'){await api(form.id==='category-create'?'/api/admin/categories':`/api/admin/categories/${form.dataset.id}`,{method:form.id==='category-create'?'POST':'PUT',body:data});notice(t('saved'));renderRoute();}
      else if(form.id==='settings-form'){data.posts_per_page=Number(data.posts_per_page);await api('/api/admin/settings',{method:'PUT',body:data});notice(t('saved'));}
      else if(form.id==='user-create'){await api('/api/admin/users',{method:'POST',body:data});notice(t('saved'));renderRoute();}
      else if(form.dataset.form==='user-edit'){data.active=$('[name="active"]',form).checked;if(!data.password)delete data.password;await api(`/api/admin/users/${form.dataset.id}`,{method:'PATCH',body:data});if(Number(form.dataset.id)===Number(user.id)){const me=await api('/api/auth/me');user=me.user;if(!user){showLogin();return;}showWorkspace();}else renderRoute();notice(t('saved'));}
      else if(form.id==='password-form'){if(data.password!==data.confirmation)throw new Error(t('passwordMismatch'));await api('/api/auth/password',{method:'POST',body:{old_password:data.old_password,password:data.password}});form.reset();notice(t('passwordChanged'));}
    }catch(e){if(form.id==='login-form'){$('#login-error').textContent=e.message;$('#login-error').hidden=false;}else notice(e.message,true);}
    finally {delete form.dataset.submitting;buttons.forEach(b=>b.disabled=false);}
  });
  document.addEventListener('input',event=>{if(event.target.closest('#article-editor')){setDirty(true);if(event.target.name==='cover_url')updateCover();if(event.target.name===`content_${articleLang}`){clearTimeout(previewTimer);previewTimer=setTimeout(updatePreview,350);}}});
  document.addEventListener('change',async event=>{
    const el=event.target;
    if(el.closest('#article-editor'))setDirty(true);
    if(!['cover-upload','markdown-image-upload','library-upload'].includes(el.id)||!el.files?.length)return;
    const owner=el.closest('#article-editor');
    const targetArea=owner?$(`[name="content_${articleLang}"]`,owner):null;
    const targetCover=owner?$('[name="cover_url"]',owner):null;
    if(owner)editorUploads++;
    el.disabled=true;
    try {
      for(const file of el.files){
        const image=await upload(file);
        if(owner?.isConnected&&el.id==='cover-upload') {targetCover.value=image.url;updateCover();setDirty(true);}
        else if(owner?.isConnected&&el.id==='markdown-image-upload') {const alt=String(file.name).replace(/[\[\]\\]/g,'');insertMarkdown(`![${alt}](${image.url})\n`,'','',targetArea);}
      }
      notice(t('uploaded'));
      if(el.id==='library-upload'&&el.isConnected)renderRoute();
    }catch(e){notice(e.message||t('uploadFailed'),true);}
    finally{if(owner)editorUploads--;el.disabled=false;el.value='';}
  });
  $('#admin-logout').addEventListener('click',async()=>{if(editorSaving){notice(t('saving'));return;}if(dirty&&!await confirmAction(t('unsaved')))return;if(!await confirmAction(t('logoutConfirm')))return;try{await api('/api/auth/logout',{method:'POST',body:{}});csrf='';showLogin();await refreshAuth();}catch(e){notice(e.message,true);}});
  $('#admin-language').addEventListener('click',async()=>{if(editorSaving){notice(t('saving'));return;}if(dirty&&!await confirmAction(t('unsaved')))return;setDirty(false);lang=lang==='zh'?'en':'zh';try{localStorage.setItem('homepage-language',lang);}catch(_){}const url=new URL(location.href);url.searchParams.set('lang',lang);history.replaceState(null,'',url);applyLanguage();if(user)renderRoute();});
  window.addEventListener('hashchange',()=>{if(ignoreHash){ignoreHash=false;return;}renderRoute();});
  window.addEventListener('beforeunload',event=>{if(dirty){event.preventDefault();event.returnValue='';}});
  applyLanguage();
  refreshAuth().then(me=>{user=me.user;if(user)showWorkspace();else showLogin();}).catch(e=>{$('#admin-loading').innerHTML=`<p class="admin-error" role="alert">${esc(e.message)}</p><button class="admin-button" id="reconnect-button">${t('reconnect')}</button>`;$('#reconnect-button').addEventListener('click',()=>location.reload());});
})();
