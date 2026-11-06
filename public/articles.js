'use strict';

(() => {
  const messages = {
    zh: {articles:'文章',lead:'阅读、思考与实践的记录。',search:'搜索文章',category:'分类',tag:'标签',allCategories:'全部分类',searchButton:'搜索',clearFilters:'清除筛选',loading:'正在加载文章…',empty:'这里还没有文章',emptyLead:'新的文章发布后，会出现在这里。',noResults:'没有找到相关文章',noResultsLead:'试试其他关键词，或清除筛选条件。',error:'暂时无法加载文章',errorLead:'请稍后重试。',retry:'重试',previous:'上一页',next:'下一页',backToArticles:'返回文章列表',readArticle:'阅读全文',published:'发布于',updated:'更新于',views:'次阅读',notFound:'文章不存在或尚未发布',translationMissing:'此语言版本尚未发布',readOther:'阅读另一语言版本',count:n=>`共 ${n} 篇文章`,page:(p,n)=>`第 ${p} / ${n} 页`},
    en: {articles:'Articles',lead:'Notes on reading, thinking, and making.',search:'Search articles',category:'Category',tag:'Tag',allCategories:'All categories',searchButton:'Search',clearFilters:'Clear filters',loading:'Loading articles…',empty:'No articles yet',emptyLead:'New articles will appear here when published.',noResults:'No matching articles',noResultsLead:'Try another search or clear your filters.',error:'Unable to load articles',errorLead:'Please try again in a moment.',retry:'Try again',previous:'Previous',next:'Next',backToArticles:'Back to articles',readArticle:'Read article',published:'Published',updated:'Updated',views:'views',notFound:'Article not found or not yet published',translationMissing:'This translation is not available',readOther:'Read the available translation',count:n=>`${n} article${n===1?'':'s'}`,page:(p,n)=>`Page ${p} of ${n}`}
  };
  let language = document.documentElement.lang.startsWith('en') ? 'en' : 'zh';
  let controller;
  let siteSettings = null;
  let startVersion = 0;
  const isDetail = document.body.dataset.page === 'article';
  const $ = id => document.getElementById(id);
  const t = key => messages[language][key];
  const siteTitle = () => siteSettings?.[`site_title_${language}`] || 'Freeze’s Nest';
  const element = (tag, className, text) => {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text !== undefined) node.textContent = text;
    return node;
  };
  function link(text, href, className = 'cms-link') {
    const node = element('a',className,text); node.href = href; return node;
  }
  function articleUrl(slug, lang = language) { return `/articles/${encodeURIComponent(slug)}?lang=${lang}`; }
  function listUrl(params = {}) {
    const q = new URLSearchParams({lang:language,...params});
    return `/articles?${q}`;
  }
  function date(value) {
    if (!value) return '';
    const d = new Date(value);
    return Number.isNaN(d.getTime()) ? '' : new Intl.DateTimeFormat(language==='zh'?'zh-CN':'en',{year:'numeric',month:'short',day:'numeric'}).format(d);
  }
  function safeImage(value) {
    if (!value) return '';
    try { const url = new URL(value,location.origin); return ['http:','https:'].includes(url.protocol) ? url.href : ''; } catch { return ''; }
  }
  async function request(url, options = {}) {
    const response = await fetch(url,{credentials:'same-origin',...options});
    const data = await response.json();
    if (!response.ok) { const err = new Error(data.error || response.statusText); err.status = response.status; err.data = data; throw err; }
    return data;
  }
  function translate() {
    document.querySelectorAll('[data-cms]').forEach(node=>{const value=t(node.dataset.cms);if(typeof value==='string')node.textContent=value;});
    document.title = `${t('articles')} · ${siteTitle()}`;
    if(!isDetail){
      const description=siteSettings?.[`description_${language}`] || t('lead');
      document.querySelector('[data-cms="lead"]').textContent=description;
      document.querySelector('meta[name="description"]').content=description;
    }
    if ($('article-results')) $('article-results').setAttribute('aria-label',t('articles'));
    if ($('article-pagination')) $('article-pagination').setAttribute('aria-label',t('articles'));
    if ($('article-back')) $('article-back').href=listUrl();
  }
  function status(target, title, text, retry, otherLanguages = []) {
    target.replaceChildren();
    const box = element('div','card-base cms-status');
    box.append(element('p','cms-status-title',title));
    if(text)box.append(element('p','',text));
    if(retry){const button=element('button','cms-button',t('retry'));button.type='button';button.addEventListener('click',retry);box.append(button);}
    for(const lang of otherLanguages){if(lang!==language){const p=element('p','');p.append(link(`${t('readOther')} (${lang==='zh'?'中文':'English'})`,articleUrl(currentSlug(),lang)));box.append(p);}}
    target.append(box);
  }
  function currentSlug() {
    return new URLSearchParams(location.search).get('slug') || decodeURIComponent(location.pathname.split('/').filter(Boolean).pop() || '');
  }
  function metadata(article, includeUpdated = false) {
    const node=element('div','cms-meta');
    if(article.category)node.append(link(article.category.name,listUrl({category:article.category.slug}),'cms-tag'));
    const published=element('time','',`${t('published')} ${date(article.published_at)}`);published.dateTime=article.published_at || '';node.append(published);
    if(includeUpdated && article.updated_at){const updated=element('time','',`${t('updated')} ${date(article.updated_at)}`);updated.dateTime=article.updated_at;node.append(updated);}
    const views=element('span','',`${article.views} ${t('views')}`);views.dataset.articleViews='';node.append(views);
    return node;
  }
  function tags(article) {
    const node=element('div','cms-tags');
    for(const tag of article.tags || [])node.append(link(`#${tag}`,listUrl({tag}),'cms-tag'));
    return node;
  }
  function card(article) {
    const node=element('article','card-base cms-card');
    const cover=safeImage(article.cover_url);
    if(cover){const a=link('',articleUrl(article.slug),'');const img=element('img','cms-card-cover');img.src=cover;img.alt=article.title;img.loading='lazy';img.decoding='async';a.append(img);node.append(a);}
    const copy=element('div','cms-card-copy');
    copy.append(metadata(article));
    const heading=element('h2','cms-card-title');heading.append(link(article.title,articleUrl(article.slug),''));copy.append(heading);
    if(article.excerpt)copy.append(element('p','cms-excerpt',article.excerpt));
    copy.append(tags(article),link(t('readArticle'),articleUrl(article.slug),'cms-link'));
    node.append(copy);return node;
  }
  function filters() {
    const search = new URLSearchParams(location.search);
    return {q:search.get('q') || '',category:search.get('category') || '',tag:search.get('tag') || '',page:String(Math.max(1,parseInt(search.get('page'),10)||1))};
  }
  function navigate(params) {
    history.pushState(null,'',listUrl(params));
    loadList();
  }
  async function loadList() {
    if(controller)controller.abort();controller=new AbortController();const signal=controller.signal;
    const selected=filters();
    $('article-query').value=selected.q;$('article-tag').value=selected.tag;
    $('article-reset').hidden=!(selected.q||selected.category||selected.tag);
    $('article-results').setAttribute('aria-busy','true');
    $('article-pagination').hidden=true;
    status($('article-results'),t('loading'));
    try {
      const params=new URLSearchParams({lang:language,...selected});
      const [data,categories] = await Promise.all([request(`/api/articles?${params}`,{signal}),request(`/api/categories?lang=${language}`,{signal})]);
      if(signal.aborted)return;
      const select=$('article-category');select.replaceChildren();
      const all=element('option','',t('allCategories'));all.value='';select.append(all);
      for(const category of categories.items){const option=element('option','',`${category.name} (${category.count})`);option.value=category.slug;select.append(option);}
      select.value=selected.category;
      $('article-result-count').textContent=t('count')(data.total);
      $('article-results').replaceChildren(...data.items.map(card));
      if(!data.items.length)status($('article-results'),t(selected.q||selected.category||selected.tag?'noResults':'empty'),t(selected.q||selected.category||selected.tag?'noResultsLead':'emptyLead'));
      if(data.pages>1){
        const nav=$('article-pagination');nav.replaceChildren();
        const previous=element('button','cms-button',t('previous'));previous.type='button';previous.disabled=data.page<=1;
        previous.addEventListener('click',()=>navigate({...selected,page:String(data.page-1)}));
        const next=element('button','cms-button',t('next'));next.type='button';next.disabled=data.page>=data.pages;
        next.addEventListener('click',()=>navigate({...selected,page:String(data.page+1)}));
        nav.append(previous,element('span','cms-page-number',t('page')(data.page,data.pages)),next);nav.hidden=false;
      }
    } catch(error) {
      if(error.name!=='AbortError'){status($('article-results'),t('error'),t('errorLead'),loadList);$('article-result-count').textContent='';}
    } finally {if(!signal.aborted)$('article-results').setAttribute('aria-busy','false');}
  }
  async function loadDetail() {
    if(controller)controller.abort();controller=new AbortController();const signal=controller.signal;
    const target=$('article-detail');target.setAttribute('aria-busy','true');status(target,t('loading'));
    try {
      const slug=currentSlug();const article=await request(`/api/articles/${encodeURIComponent(slug)}?lang=${language}`,{signal});
      if(signal.aborted)return;
      document.title=`${article.title} · ${siteTitle()}`;
      document.querySelector('meta[name="description"]').content=article.excerpt || article.title;
      let canonical=document.querySelector('link[rel="canonical"]');if(!canonical){canonical=document.createElement('link');canonical.rel='canonical';document.head.append(canonical);}canonical.href=`${location.origin}/articles/${encodeURIComponent(slug)}`;
      const node=element('article','card-base cms-article');
      const header=element('header','cms-article-header');header.append(element('h1','cms-article-title',article.title),metadata(article,true),tags(article));node.append(header);
      const cover=safeImage(article.cover_url);if(cover){const img=element('img','cms-article-cover');img.src=cover;img.alt=article.title;img.decoding='async';node.append(img);}
      const content=element('div','cms-markdown');
      // The backend is the sole Markdown renderer and sanitizes its HTML allowlist.
      content.innerHTML=article.html;
      content.querySelectorAll('a').forEach(a=>{if(a.origin!==location.origin)a.rel='noopener noreferrer';});
      node.append(content);
      const footer=element('footer','cms-article-footer');footer.append(link(t('backToArticles'),listUrl()));node.append(footer);
      target.replaceChildren(node);
      request(`/api/articles/${encodeURIComponent(slug)}/view`,{method:'POST',signal}).then(data=>{if(!signal.aborted)target.querySelectorAll('[data-article-views]').forEach(n=>n.textContent=`${data.views} ${t('views')}`);}).catch(()=>{});
    }catch(error){
      if(error.name!=='AbortError'){
        const languages=error.data?.available_languages||[];
        status(target,t(error.status===404?(languages.length?'translationMissing':'notFound'):'error'),error.status===404?'':t('errorLead'),error.status===404?null:loadDetail,languages);
      }
    }finally {if(!signal.aborted)target.setAttribute('aria-busy','false');}
  }
  const settingsReady = request('/api/settings').then(data=>{siteSettings=data;}).catch(()=>{});
  async function start(){
    const version=++startVersion;
    if(controller)controller.abort();
    translate();
    await settingsReady;
    if(version!==startVersion)return;
    translate();
    isDetail?loadDetail():loadList();
  }
  document.addEventListener('site-language-change',event=>{language=event.detail.language;start();});
  if(!isDetail){
    $('article-search').addEventListener('submit',event=>{event.preventDefault();navigate({q:$('article-query').value.trim(),category:$('article-category').value,tag:$('article-tag').value.trim()});});
    $('article-category').addEventListener('change',()=>navigate({q:$('article-query').value.trim(),category:$('article-category').value,tag:$('article-tag').value.trim()}));
    $('article-reset').addEventListener('click',()=>navigate({}));
    window.addEventListener('popstate',()=>{
      const requested=new URLSearchParams(location.search).get('lang');
      if(['zh','en'].includes(requested)&&requested!==language){location.reload();return;}
      loadList();
    });
  }
  start();
})();
