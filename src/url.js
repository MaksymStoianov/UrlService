/**
 * MIT License
 * 
 * Copyright (c) 2023 Maksym Stoianov
 * 
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 * 
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 * 
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */



/**
 * Конструктор URL.
 * @class               URL
 * @namespace           URL
 * @version             1.1.0
 * @author              Maksym Stoianov <stoianov.maksym@gmail.com>
 * @license             MIT
 * @tutorial            https://maksymstoianov.com/
 * @see                 [GitHub](https://github.com/MaksymStoianov/UrlService)
 */
class URL {

  /**
   * Создает и возвращает экземпляр класса [`URL`](#).
   * @return {URL}
   */
  static newUrl(...args) {
    return Reflect.construct(this, args);
  }



  /**
   * @static
   * @readonly
   */
  static get patterns() {
    const result = {};

    // TODO Вынести регулярные выражения за пределы метода.
    
    result.protocol = `(([^:/?#]+):)`;
    result.username = `([^:@]*)(:|@)`;
    result.password = `:?([^:@]*)@`;
    result.authentication = `((?:(([^:@]*):?([^:@]*))?@)?)`;
    // result.hostname = `([^/?#]*?)`;
    result.hostname = `((([a-zа-яієїґё0-9]([a-zа-яієїґё0-9-_]*[a-zа-яієїґё0-9])*)\\.)+[a-zа-яієїґё]{2,}|(([0-9]{1,3}\\.){3}[0-9]{1,3}))`;
    result.port = `([0-9]+)`;
    result.host = `(${result.hostname}(:${result.port})?)`;
    result.pathname = `((\\/[^?#]*?)*?)?`;
    result.search = `(\\?[^#]*?)?`;
    result.hash = `(?:#(.*))?`;
    result.origin = `(${result.protocol}?\\/\\/)?${result.host}`;
    result.href = `(${result.protocol}?\\/\\/)?${result.authentication}${result.host}${result.pathname}${result.search}${result.hash}`;

    result.tel = `tel:([^\\/]*?)${result.search}${result.hash}`;
    result.mailto = `mailto:([^\\/]*?)${result.search}${result.hash}`;

    result.protocol = result.protocol
      .replace(/\:\)$/, `:?)`);

    result.username = result.username
      .replace(/\(\:\|\@\)$/, '');

    result.password = result.password
      .replace(/@$/, '');


    for (const key in result) {
      result[`_${key}`] = result[key];
      result[key] = new RegExp(`^${result[key]}$`, 'i');
    }

    return result;
  }



  /**
   * Проверяет, является ли входное значение объектом, представляющий URL-адрес.
   * @param {*} input Значение для проверки.
   * @return {boolean} `true`, если входное значение является URL-адресом, иначе `false`.
   */
  static isUrl(input) {
    if (!arguments.length) {
      throw new Error(`The parameters () don't match any method signature for ${this.name}.isUrl.`);
    }

    return (input instanceof this);
  }



  /**
   * Проверяет, является ли входное значение объектом или строкой, представляющей URL-адрес.
   * @param {*} input Значение для проверки.
   * @return {boolean} `true`, если входное значение является URL-адресом, иначе `false`.
   */
  static isUrlLike(input) {
    if (!arguments.length) {
      throw new Error(`The parameters () don't match any method signature for ${this.name}.isUrlLike.`);
    }

    return (
      input instanceof this ||
      (
        typeof input === 'string' &&
        (
          this.patterns.href.test(input) ||
          /^(tel|mailto):/i.test(input.trim())
        )
      )
    );
  }



  /**
   * Разбивает строку URL-адрес. И возвращает объект с компонентами URL.
   * @param {string} str URL.
   * @return {Object}
   */
  static parseUrl(str) {
    const result = {
      "href": '',
      "protocol": '',
      "username": '',
      "password": '',
      "host": '',
      "hostname": '',
      "port": '',
      "pathname": '',
      "search": '',
      "hash": '',
      "origin": ''
    };

    if (!arguments.length) {
      throw new Error(`Параметры () не соответствуют сигнатуре метода ${this.name}.parseUrl.`);
    }

    if (!(typeof str === 'string' && this.isUrlLike(str))) {
      throw new TypeError(`Параметр (${typeof str}) не является ${this.name}.`);
    }

    str = str.trim();

    if (/^tel:/i.test(str)) {
      result.protocol = `tel:`;

      const match = this.patterns.tel.exec(str);

      result.origin = 'null';
      result.pathname = (match[1] || '');
      result.search = ((item => item === '?' ? '' : item)(match[2]) || '');
      result.hash = (item => item.length ? `#${item}` : '')(match[3] || '');
    }

    else if (/^mailto:/i.test(str)) {
      result.protocol = `mailto:`;

      const match = this.patterns.mailto.exec(str);

      result.origin = 'null';
      result.pathname = (match[1] || '');
      result.search = ((item => item === '?' ? '' : item)(match[2]) || '');
      result.hash = (item => item.length ? `#${item}` : '')(match[3] || '');
    }

    else {
      const match = this.patterns.href.exec(decodeURI(str));

      result.protocol = ((match[3] ? `${match[3]}:` : '') || '').toLowerCase();
      result.username = (match[6] || '');
      result.password = (match[7] || '');
      result.hostname = (match[9] || '').toLowerCase();
      result.port = (match[16] || '');
      result.host = `${result.hostname}${result.hostname.length && result.port.length ? `:${result.port}` : ''}`;
      result.pathname = (item => item[0] === '/' ? item : `/${item}`)((match[17] || '').replace(/.*\.\.?\//g, ''))
      result.search = ((item => item === '?' ? '' : item)(match[19]) || '');
      result.hash = (item => item.length ? `#${item}` : '')(match[20] || '');
      result.origin = `${result.protocol}${result.host.length ? `//${result.host}` : ''}`;
      result.href = `${result.protocol}${(item => item.length ? `//${item}` : '')(`${result.username.length || result.password.length ? `${result.username}:${result.password}@` : ''}${result.host}`)}${result.pathname}${result.search}${result.hash}`;
    }

    return result;
  }



  /**
   * @param {string} url Абсолютный или относительный `URL`.
   * @param {string} base Базовый URL для использования в случае `url` является относительным URL-адресом.
   */
  constructor(url, base) {
    if (!arguments.length) {
      throw new Error(`Параметры () не соответствуют сигнатуре конструктора ${this.constructor.name}.`);
    }


    /**
     * @private
     * @readonly
     * @type {Object}
     */
    Object.defineProperty(this, 'value', {
      "configurable": true,
      "enumerable": false,
      "writable": true,
      "value": {
        "href": '',
        "protocol": '',
        "username": '',
        "password": '',
        "host": '',
        "hostname": '',
        "port": '',
        "pathname": '',
        "search": '',
        "searchParams": new URLSearchParams(),
        "hash": '',
        "origin": ''
      }
    });


    if (!url) {
      throw new TypeError(`Параметры (${typeof url}) не соответствуют сигнатуре конструктора ${this.constructor.name}.`);
    }

    else if (this.constructor.isUrlLike(url)) {
      this.href = (typeof url !== 'string' ? String(url) : url);
    }

    else if (typeof url === 'string' && this.constructor.isUrlLike(base)) {
      this.href = (typeof base !== 'string' ? String(base) : base);

      url = url.trim()

      if (url[0] === '.') {
        // Относительный
        let stack = this.href.split('/');

        stack.pop();

        for (const part of url.split('/')) {
          if (part === '..') {
            stack.pop();
          }

          else if (part !== '.') {
            stack.push(part);
          }
        }

        this.pathname = stack.join('/');
      }

      else {
        // Абсолютный
        this.pathname = url.replace(/\.\.?\//g, '');
      }
    }

    else throw new TypeError(`Параметры (${typeof url}, ${typeof base}) не соответствуют сигнатуре конструктора ${this.constructor.name}.`);
  }



  /**
   * Возвращает `href`.
   * @return {string}
   */
  get href() {
    return this.value.href;
  }



  /**
   * Устанавливает `href`.
   * @param {string} href
   * @return {URL}
   */
  set href(href) {
    if (!(typeof href === 'string' && this.constructor.isUrlLike(href))) {
      throw new TypeError(`Параметры (${typeof href}) не соответствуют сигнатуре метода ${this.constructor.name}.href.`);
    }

    href = href.trim();

    this.value = this.constructor.parseUrl(href);

    this.value.searchParams = new URLSearchParams(this.value.search);
    this.value.href = `${this.protocol}${(item => item.length ? `//${item}` : '')(`${this.username.length || this.password.length ? `${this.username}:${this.password}@` : ''}${this.host}`)}${this.pathname}${this.search}${this.hash}`;
  }



  /**
   * Возвращает `protocol`, включая `:`.
   * @return {string}
   */
  get protocol() {
    return this.value.protocol;
  }



  /**
   * Устанавливает `protocol`.
   * @param {string} protocol
   * @return {string}
   */
  set protocol(protocol) {
    if (typeof protocol !== 'string') {
      throw new TypeError(`Параметры (${typeof protocol}) не соответствуют сигнатуре метода ${this.constructor.name}.protocol.`);
    }

    protocol = protocol.trim();

    if (this.constructor.isUrlLike(protocol)) {
      this.value.protocol = this.constructor.parseUrl(protocol).protocol;
    }

    else {
      this.value.protocol = (item => item && item[2] ? `${item[2]}:` : '')(this.constructor.patterns.protocol.exec(protocol));
    }

    this.value.origin = `${this.protocol}${this.host.length ? `//${this.host}` : ''}`;
    this.value.href = `${this.protocol}${(item => item.length ? `//${item}` : '')(`${this.username.length || this.password.length ? `${this.username}:${this.password}@` : ''}${this.host}`)}${this.pathname}${this.search}${this.hash}`;
  }



  /**
   * Возвращает `username`.
   * @return {string}
   */
  get username() {
    return this.value.username;
  }



  /**
   * Устанавливает `username`.
   * @param {(string|number)} username
   * @return {string}
   */
  set username(username) {
    if (!['string', 'number'].includes(typeof username)) {
      throw new TypeError(`Параметры (${typeof username}) не соответствуют сигнатуре метода ${this.constructor.name}.username.`);
    }

    if (/^(tel|mailto):/i.test(this.protocol)) return;

    username = String(username).trim();

    if (this.constructor.isUrlLike(username)) {
      this.value.username = this.constructor.parseUrl(username).username;
    }

    else {
      this.value.username = (item => item && item[1] ? item[1] : '')(this.constructor.patterns.username.exec(username));
    }

    this.value.href = `${this.protocol}${(item => item.length ? `//${item}` : '')(`${this.username.length || this.password.length ? `${this.username}:${this.password}@` : ''}${this.host}`)}${this.pathname}${this.search}${this.hash}`;
  }



  /**
   * Возвращает `password`.
   * @return {string}
   */
  get password() {
    return this.value.password;
  }



  /**
   * Устанавливает `password`.
   * @param {(string|number)} password
   * @return {string}
   */
  set password(password) {
    if (!['string', 'number'].includes(typeof password)) {
      throw new TypeError(`Параметры (${typeof password}) не соответствуют сигнатуре метода ${this.constructor.name}.password.`);
    }

    if (/^(tel|mailto):/i.test(this.protocol)) return;

    password = String(password).trim();

    if (this.constructor.isUrlLike(password)) {
      this.value.password = this.constructor.parseUrl(password).password;
    }

    else {
      this.value.password = (item => item && item[1] ? item[1] : '')(this.constructor.patterns.password.exec(password));
    }

    this.value.href = `${this.protocol}${(item => item.length ? `//${item}` : '')(`${this.username.length || this.password.length ? `${this.username}:${this.password}@` : ''}${this.host}`)}${this.pathname}${this.search}${this.hash}`;
  }



  /**
   * Возвращает hostname.
   * @return {string}
   */
  get hostname() {
    return this.value.hostname;
  }



  /**
   * Устанавливает `hostname`.
   * @param {string} hostname
   * @return {string}
   */
  set hostname(hostname) {
    if (typeof hostname !== 'string') {
      throw new TypeError(`Параметры (${typeof hostname}) не соответствуют сигнатуре метода ${this.constructor.name}.hostname.`);
    }

    if (/^(tel|mailto):/i.test(this.protocol)) return;

    hostname = hostname.trim();

    hostname = this.constructor.parseUrl(hostname).hostname;

    if (!hostname.length) return;

    this.value.hostname = hostname;
    this.value.host = `${this.hostname}${this.hostname.length && this.port.length ? `:${this.port}` : ''}`;
    this.value.origin = `${this.protocol}${this.host.length ? `//${this.host}` : ''}`;

    this.value.href = `${this.protocol}${(item => item.length ? `//${item}` : '')(`${this.username.length || this.password.length ? `${this.username}:${this.password}@` : ''}${this.host}`)}${this.pathname}${this.search}${this.hash}`;
  }



  /**
   * Возвращает `port`.
   * @return {string}
   */
  get port() {
    return this.value.port;
  }



  /**
   * Устанавливает `port`.
   * @param {(string|number)} port
   * @return {string}
   */
  set port(port) {
    if (!['string', 'number'].includes(typeof port)) {
      throw new TypeError(`Параметры (${typeof port}) не соответствуют сигнатуре метода ${this.constructor.name}.port.`);
    }

    if (/^(tel|mailto):/i.test(this.protocol)) return;

    port = String(port).trim();

    if (!this.hostname.length) {
      this.value.port = '';
    }

    else if (this.constructor.isUrlLike(port)) {
      this.value.port = this.constructor.parseUrl(port).port;
    }

    else if (typeof port === 'number' && Number.isInteger(port) && port >= 0) {
      this.value.port = String(port);
    }

    else if (typeof port === 'string') {
      this.value.port = (item => item[1] ? String(Number(item[1])) : '')(this.constructor.patterns.port.exec(port));
    }

    this.value.host = `${this.hostname}${this.hostname.length && this.port.length ? `:${this.port}` : ''}`;
    this.value.origin = `${this.protocol}${this.host.length ? `//${this.host}` : ''}`;

    this.value.href = `${this.protocol}${(item => item.length ? `//${item}` : '')(`${this.username.length || this.password.length ? `${this.username}:${this.password}@` : ''}${this.host}`)}${this.pathname}${this.search}${this.hash}`;
  }



  /**
   * Возвращает `host`, а именно `hostname`, `:` и `port`.
   * @return {string}
   */
  get host() {
    return this.value.host;
  }



  /**
   * Устанавливает `host`.
   * @param {string} host
   * @return {string}
   */
  set host(host) {
    if (!(typeof host === 'string' && this.constructor.isUrlLike(host))) {
      throw new TypeError(`Параметры (${typeof host}) не соответствуют сигнатуре метода ${this.constructor.name}.host.`);
    }

    if (/^(tel|mailto):/i.test(this.protocol)) return;

    host = host.trim();

    host = this.constructor.parseUrl(host);

    this.value.hostname = host.hostname;

    this.value.port = host.port;

    this.value.host = `${this.hostname}${this.hostname.length && this.port.length ? `:${this.port}` : ''}`;
    this.value.origin = `${this.protocol}${this.host.length ? `//${this.host}` : ''}`;
    this.value.href = `${this.protocol}${(item => item.length ? `//${item}` : '')(`${this.username.length || this.password.length ? `${this.username}:${this.password}@` : ''}${this.host}`)}${this.pathname}${this.search}${this.hash}`;
  }



  /**
   * Возвращает `pathname`.
   * @return {string}
   */
  get pathname() {
    return this.value.pathname;
  }



  /**
   * Устанавливает `pathname`.
   * @param {string} pathname
   * @return {string}
   */
  set pathname(pathname) {
    if (typeof pathname !== 'string') {
      throw new TypeError(`Параметры (${typeof pathname}) не соответствуют сигнатуре метода ${this.constructor.name}.pathname.`);
    }

    if (/^(tel|mailto):/i.test(this.protocol)) return;

    pathname = pathname.trim();

    if (this.constructor.isUrlLike(pathname)) {
      pathname = this.constructor.parseUrl(pathname).pathname;

      this.value.pathname = pathname;
    }

    else {
      this.value.pathname = (item => item && item[1] ? item[1] : '')(this.constructor.patterns.pathname.exec(pathname[0] === '/' ? pathname : `/${pathname}`));
    }

    this.value.pathname = (item => item[0] === '/' ? item : `/${item}`)(this.value.pathname.replace(/.*\.\.?\//g, ''));
    this.value.href = `${this.protocol}${(item => item.length ? `//${item}` : '')(`${this.username.length || this.password.length ? `${this.username}:${this.password}@` : ''}${this.host}`)}${this.pathname}${this.search}${this.hash}`;
  }



  /**
   * Возвращает `?` с последующими параметрами.
   * @return {string}
   */
  get search() {
    return this.value.search;
  }



  /**
   * Устанавливает `search`.
   * @param {string} search
   * @return {string}
   */
  set search(search) {
    if (typeof search !== 'string') {
      throw new TypeError(`Параметры (${typeof search}) не соответствуют сигнатуре метода ${this.constructor.name}.search.`);
    }

    search = search.trim();

    if (this.constructor.isUrlLike(search)) {
      search = this.constructor.parseUrl(search).search;

      this.value.search = search;
    }

    else {
      this.value.search = (item => item && item[1] && item[1][0] === '?' ? item[1] : '')(this.constructor.patterns.search.exec(search[0] === '?' ? search : `?${search}`));
    }

    this.value.searchParams = new URLSearchParams(this.value.search);
    this.value.href = `${this.protocol}${(item => item.length ? `//${item}` : '')(`${this.username.length || this.password.length ? `${this.username}:${this.password}@` : ''}${this.host}`)}${this.pathname}${this.search}${this.hash}`;
  }



  /**
   * Возвращает `searchParams`.
   * @return {Object}
   */
  get searchParams() {
    return this.value.searchParams;
  }



  /**
   * Устанавливает `searchParams`.
   * @param {URLSearchParams} searchParams
   * @return {URLSearchParams}
   */
  set searchParams(searchParams) {
    if (!URLSearchParams.isUrlSearchParams(searchParams)) {
      throw new TypeError(`Параметры (${typeof searchParams}) не соответствуют сигнатуре метода ${this.constructor.name}.searchParams.`);
    }

    this.value.searchParams = searchParams;
    this.value.search = (item => item.length ? `?${item}` : '')(this.searchParams.toString());
    this.value.href = `${this.protocol}${(item => item.length ? `//${item}` : '')(`${this.username.length || this.password.length ? `${this.username}:${this.password}@` : ''}${this.host}`)}${this.pathname}${this.search}${this.hash}`;
  }



  /**
   * Возвращает `#` с последующим идентификатором.
   * @return {string}
   */
  get hash() {
    return this.value.hash;
  }



  /**
   * Устанавливает `hash`.
   * @param {string} hash
   * @return {string}
   */
  set hash(value) {
    if (typeof value !== 'string') {
      throw new TypeError(`Параметры (${typeof value}) не соответствуют сигнатуре метода ${this.constructor.name}.hash.`);
    }

    value = value.trim();

    if (this.constructor.isUrlLike(value)) {
      value = this.constructor.parseUrl(value).hash;

      if (value.length) {
        this.value.hash = value;
      }
    }

    else {
      this.value.hash = (item => item && item[1] ? `#${item[1]}` : '')(this.constructor.patterns.hash.exec(value[0] === `#` ? value : `#${value}`));
    }

    this.value.href = `${this.protocol}${(item => item.length ? `//${item}` : '')(`${this.username.length || this.password.length ? `${this.username}:${this.password}@` : ''}${this.host}`)}${this.pathname}${this.search}${this.hash}`;
  }



  /**
   * Возвращает `protocol`, `hostname` и `port`.
   * @return {string}
   */
  get origin() {
    return this.value.origin;
  }



  /**
   * Устанавливает `origin`.
   * @return {string}
   */
  set origin(value) {
    if (!(typeof value === 'string' && this.constructor.isUrlLike(value))) {
      throw new TypeError(`Параметры (${typeof value}) не соответствуют сигнатуре метода ${this.constructor.name}.origin.`);
    }

    value = value.trim();

    value = this.constructor.parseUrl(value);

    this.value.protocol = value.protocol;
    this.value.hostname = value.hostname;
    this.value.port = value.port;
    this.value.host = `${this.hostname}${this.port.length ? `:${this.port}` : ''}`;
    this.value.origin = `${this.protocol}${this.host.length ? `//${this.host}` : ''}`;
    this.value.href = `${this.protocol}${(item => item.length ? `//${item}` : '')(`${this.username.length || this.password.length ? `${this.username}:${this.password}@` : ''}${this.host}`)}${this.pathname}${this.search}${this.hash}`;
  }



  /**
   * Возвращает `String` содержащий последовательную версию `URL`, хотя на практике это, кажется, имеет тот же эффект, как `URL.toString()`.
   * @return {string} href.
   */
  toJSON() {
    return this.href;
  }



  /**
   * Вызывается при преобразовании объекта в соответствующее примитивное значение.
   * @param {string} hint Строковый аргумент, который передаёт желаемый тип примитива.
   *    Может быть: 'number', 'string', и `default`.
   * @return {string}
   */
  [Symbol.toPrimitive](hint) {
    return this.href;
  }



  /**
   * Метод `toString()` возвращает строку, представляющую объект.
   * @return {string}
   */
  toString() {
    return this.href;
  }

}





/**
 * Конструктор URLSearchParams.
 * @class               URLSearchParams
 * @namespace           URLSearchParams
 * @version             1.1.0
 * @author              Maksym Stoianov <stomaks@gmail.com>
 * @license             MIT
 * @tutorial            https://maksymstoianov.com/
 * @see                [Source](https://script.google.com/home/projects/1QCIhfEvmPkdVnri2LurMTLDAxvU4p2xAlZvmBcTKeDgfNJtnXyXezlsq/edit)
 */
class URLSearchParams {

  /**
   * Создает и возвращает экземпляр класса [`URLSearchParams`](#).
   * @return {URLSearchParams}
   */
  static newUrlSearchParams(...args) {
    return Reflect.construct(this, args);
  }



  /**
   * Кодирует компонент универсального идентификатора ресурса (URI).
   * @param {string} str
   * @return {string}
   */
  static encodeURIComponent(str) {
    return encodeURIComponent(str)
      .replace(/[!'()*]/g, item => `%${item.charCodeAt(0).toString(16)}`)
      .replace(/%20/g, `+`);
  }



  /**
   * Декодирует компонент универсального идентификатора ресурса (URI).
   * @param {string} str
   * @return {string}
   */
  static decodeURIComponent(str) {
    return decodeURIComponent(str.replace(/\+/g, `%20`));
  }



  /**
   * Проверяет, является ли входное значение объектом, представляющей `URLSearchParams`.
   * @param {*} input Значение для проверки.
   * @return {boolean} `true`, если входное значение является `URLSearchParams`, иначе `false`.
   */
  static isUrlSearchParams(input) {
    if (!arguments.length) {
      throw new Error(`The parameters () don't match any method signature for ${this.name}.isUrlSearchParams.`);
    }

    return (input instanceof this);
  }



  /**
   * @param {(string|Array|object|URLSearchParams)} searchParams
   */
  constructor(searchParams = '') {

    /**
     * @private
     * @readonly
     * @type {Array}
     */
    Object.defineProperty(this, 'value', {
      "configurable": true,
      "enumerable": false,
      "writable": true,
      "value": []
    });


    if (['string', 'number'].includes(typeof searchParams)) {
      searchParams = (item => item[0] === '?' ? item.slice(1) : item)(String(searchParams));

      if (searchParams.length) {
        searchParams
          .split('&')
          .forEach(item => this.append.apply(this, (item => {
            item[1] = item[1] || '';
            return item;
          })(item.split('='))));
      }
    }

    else if (this.constructor.isUrlSearchParams(searchParams)) {
      return new URLSearchParams(searchParams.toString());
    }

    else if (Array.isArray(searchParams)) {
      for (const item of searchParams) {
        if (Array.isArray(item) && item.length === 2) {
          this.append.apply(this, item);
        }

        else throw new TypeError(`Не удалось создать ${this.constructor.name}: указанное значение не может быть преобразовано в последовательность.`);
      }
    }

    else if (typeof searchParams === `object`) {
      for (const key in searchParams) {
        this.append.apply(this, [key, searchParams[key]]);
      }
    }

    else throw new TypeError(`Параметры (${typeof searchParams}) не соответствуют сигнатуре конструктора ${this.constructor.name}.`);

  }



  /**
   * Добавляет указанную пару ключ / значение в качестве нового параметра поиска.
   * @param {(string|number)} name Имя добавляемого параметра.
   * @param {*} value Значение добавляемого параметра.
   * @return {URLSearchParams}
   */
  append(name, value) {
    if (!arguments.length) {
      throw new Error(`Параметры () не соответствуют сигнатуре метода ${this.constructor.name}.append.`);
    }

    if (!['string', 'number'].includes(typeof name)) {
      throw new TypeError(`Параметры (${typeof name}) не соответствуют сигнатуре метода ${this.constructor.name}.append.`);
    }

    if (arguments.length == 1) {
      throw new TypeError(`Не удалось выполнить append в ${this.constructor.name}: требуется 2 аргумента, но присутствует только 1.`);
    }

    this.value.push({
      "name": name,
      "value": ['string', 'number'].includes(typeof value) ? String(value) : JSON.stringify(value)
    });

    return this;
  }



  /**
   * Удаляет заданный параметр поиска и все связанные с ним значения из списка всех параметров поиска.
   * @param {(string|number)} name Имя добавляемого параметра.
   * @return {URLSearchParams}
   */
  delete(name) {
    if (!arguments.length) {
      throw new Error(`Параметры () не соответствуют сигнатуре метода ${this.constructor.name}.delete.`);
    }

    if (!['string', 'number'].includes(typeof name)) {
      throw new TypeError(`Параметры (${typeof name}) не соответствуют сигнатуре метода ${this.constructor.name}.delete.`);
    }

    this.value = this.value
      .filter(item => item.name !== name);

    return this;
  }



  /**
   * Возвращает итератор, позволяющий выполнять итерацию по всем парам ключ / значение, содержащимся в этом объекте.
   * @return {URLSearchParams}
   */
  entries() {
    return this.value
      .map(item => [item.name, item.value]);
  }



  /**
   * Позволяет перебирать все значения, содержащиеся в этом объекте, с помощью функции обратного вызова.
   * @param {function} callback Функция, выполняемая для каждого элемента, которому передаются следующие аргументы:
   *   @param {string} callback.value Значение текущей записи, обрабатываемой в объекте `URLSearchParams`.
   *   @param {string} callback.key Ключ текущей записи, обрабатываемой в объекте `URLSearchParams`.
   *   @param {URLSearchParams} callback.searchParams Объект URLSearchParams, к которому был обращен вызов `forEach()`.
   * @param {*} thisArg [необязательный] Значение, которое будет использоваться как this при выполнении обратного вызова.
   * @return {URLSearchParams}
   */
  forEach(callback, thisArg) {
    if (!arguments.length) {
      throw new Error(`Параметры () не соответствуют сигнатуре метода ${this.constructor.name}.forEach.`);
    }

    if (typeof callback !== 'function') {
      throw new TypeError(`Параметры (${typeof callback}) не соответствуют сигнатуре метода ${this.constructor.name}.forEach.`);
    }

    return this.value
      .forEach(item => callback.apply(thisArg || null, [item.value, item.name, this]));
  }



  /**
   * Возвращает первое значение, связанное с заданным параметром поиска.
   * @param {string|number} name Имя возвращаемого параметра.
   * @return {string} `Строка`, если данный параметр поиска найден; в противном случае - `null`.
   */
  get(name) {
    if (!arguments.length) {
      throw new Error(`Параметры () не соответствуют сигнатуре метода ${this.constructor.name}.get.`);
    }

    if (!['string', 'number'].includes(typeof name)) {
      throw new TypeError(`Параметры (${typeof name}) не соответствуют сигнатуре метода ${this.constructor.name}.get.`);
    }

    return (item => item ? item.value : null)(this.value.find(item => item.name === name));
  }



  /**
   * Возвращает все значения, связанные с заданным параметром поиска, в виде `массива`.
   * @param {string|number} name Имя возвращаемого параметра.
   * @return {string[]}
   */
  getAll(name) {
    if (!arguments.length) {
      throw new Error(`Параметры () не соответствуют сигнатуре метода ${this.constructor.name}.getAll.`);
    }

    if (!['string', 'number'].includes(typeof name)) {
      throw new TypeError(`Параметры (${typeof name}) не соответствуют сигнатуре метода ${this.constructor.name}.getAll.`);
    }

    return this.value
      .filter(item => item.name === name)
      .map(item => item.value);
  }



  /**
   * Возвращает логическое значение, указывающее, существует ли параметр с указанным именем.
   * @param {(string|number)} name Имя возвращаемого параметра.
   * @return {boolean}
   */
  has(name) {
    if (!arguments.length) {
      throw new Error(`Параметры () не соответствуют сигнатуре метода ${this.constructor.name}.has.`);
    }

    if (!['string', 'number'].includes(typeof name)) {
      throw new TypeError(`Параметры (${typeof name}) не соответствуют сигнатуре метода ${this.constructor.name}.has.`);
    }

    return (item => item < 0 ? false : true)(this.value.findIndex(item => item.name === name));
  }



  /**
   * Возвращает итератор, позволяющий перебирать все ключи, содержащиеся в этом объекте.
   * @return {string[]}
   */
  keys() {
    return this.value
      .map(item => item.name);
  }



  /**
   * Устанавливает значение, связанное с заданным параметром поиска, равным заданному значению. Если было несколько совпадающих значений, этот метод удаляет остальные. Если параметр поиска не существует, этот метод создает его.
   * @param {(string|number)} name Имя добавляемого параметра.
   * @param {*} value Значение добавляемого параметра.
   * @return {URLSearchParams}
   */
  set(name, value) {
    return this
      .delete(name)
      .append(name, value);
  }



  /**
   * Сортирует все пары ключ / значение, содержащиеся в этом объекте по ключу.
   * @return {URLSearchParams}
   */
  sort() {
    this.value = this.value
      .sort((a, b) => ((a, b) => a > b ? 1 : a === b ? 0 : -1)(a.name, b.name));

    return this;
  }



  /**
   * Возвращает итератор, позволяющий перебирать все значения, содержащиеся в этом объекте.
   * @return {string[]}
   */
  values() {
    return this.value
      .map(item => item.value);
  }



  /**
   * Вызывается при преобразовании объекта в соответствующее примитивное значение.
   * @param {string} hint Строковый аргумент, который передаёт желаемый тип примитива.
   *    Может быть: 'number', 'string', и `default`.
   * @return {string}
   */
  [Symbol.toPrimitive](hint) {
    return this.toString.apply(this);
  }



  /**
   * Метод `toString()` возвращает строку, представляющую объект.
   * @return {string}
   */
  toString() {
    return this.value
      .map(item => [item.name, item.value].map(this.constructor.encodeURIComponent).join('='))
      .join('&');
  }

}
