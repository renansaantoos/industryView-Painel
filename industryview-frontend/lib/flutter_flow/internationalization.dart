import 'package:flutter/cupertino.dart';
import 'package:flutter/material.dart';
import 'package:flutter/foundation.dart';
import 'package:shared_preferences/shared_preferences.dart';

const _kLocaleStorageKey = '__locale_key__';

class FFLocalizations {
  FFLocalizations(this.locale);

  final Locale locale;

  static FFLocalizations of(BuildContext context) =>
      Localizations.of<FFLocalizations>(context, FFLocalizations)!;

  static List<String> languages() => ['pt', 'es', 'en'];

  static late SharedPreferences _prefs;
  static Future initialize() async =>
      _prefs = await SharedPreferences.getInstance();
  static Future storeLocale(String locale) =>
      _prefs.setString(_kLocaleStorageKey, locale);
  static Locale? getStoredLocale() {
    final locale = _prefs.getString(_kLocaleStorageKey);
    return locale != null && locale.isNotEmpty ? createLocale(locale) : null;
  }

  String get languageCode => locale.toString();
  String? get languageShortCode =>
      _languagesWithShortCode.contains(locale.toString())
          ? '${locale.toString()}_short'
          : null;
  int get languageIndex => languages().contains(languageCode)
      ? languages().indexOf(languageCode)
      : 0;

  String getText(String key) =>
      (kTranslationsMap[key] ?? {})[locale.toString()] ?? '';

  String getVariableText({
    String? ptText = '',
    String? esText = '',
    String? enText = '',
  }) =>
      [ptText, esText, enText][languageIndex] ?? '';

  static const Set<String> _languagesWithShortCode = {
    'ar',
    'az',
    'ca',
    'cs',
    'da',
    'de',
    'dv',
    'en',
    'es',
    'et',
    'fi',
    'fr',
    'gr',
    'he',
    'hi',
    'hu',
    'it',
    'km',
    'ku',
    'mn',
    'ms',
    'no',
    'pt',
    'ro',
    'ru',
    'rw',
    'sv',
    'th',
    'uk',
    'vi',
  };
}

/// Used if the locale is not supported by GlobalMaterialLocalizations.
class FallbackMaterialLocalizationDelegate
    extends LocalizationsDelegate<MaterialLocalizations> {
  const FallbackMaterialLocalizationDelegate();

  @override
  bool isSupported(Locale locale) => _isSupportedLocale(locale);

  @override
  Future<MaterialLocalizations> load(Locale locale) async =>
      SynchronousFuture<MaterialLocalizations>(
        const DefaultMaterialLocalizations(),
      );

  @override
  bool shouldReload(FallbackMaterialLocalizationDelegate old) => false;
}

/// Used if the locale is not supported by GlobalCupertinoLocalizations.
class FallbackCupertinoLocalizationDelegate
    extends LocalizationsDelegate<CupertinoLocalizations> {
  const FallbackCupertinoLocalizationDelegate();

  @override
  bool isSupported(Locale locale) => _isSupportedLocale(locale);

  @override
  Future<CupertinoLocalizations> load(Locale locale) =>
      SynchronousFuture<CupertinoLocalizations>(
        const DefaultCupertinoLocalizations(),
      );

  @override
  bool shouldReload(FallbackCupertinoLocalizationDelegate old) => false;
}

class FFLocalizationsDelegate extends LocalizationsDelegate<FFLocalizations> {
  const FFLocalizationsDelegate();

  @override
  bool isSupported(Locale locale) => _isSupportedLocale(locale);

  @override
  Future<FFLocalizations> load(Locale locale) =>
      SynchronousFuture<FFLocalizations>(FFLocalizations(locale));

  @override
  bool shouldReload(FFLocalizationsDelegate old) => false;
}

Locale createLocale(String language) => language.contains('_')
    ? Locale.fromSubtags(
        languageCode: language.split('_').first,
        scriptCode: language.split('_').last,
      )
    : Locale(language);

bool _isSupportedLocale(Locale locale) {
  final language = locale.toString();
  return FFLocalizations.languages().contains(
    language.endsWith('_')
        ? language.substring(0, language.length - 1)
        : language,
  );
}

final kTranslationsMap = <Map<String, Map<String, String>>>[
  // Login
  {
    'kcf4fgf7': {
      'pt': 'brand.ai',
      'en': 'brand.ai',
      'es': 'marca.ai',
    },
    'up32mhuw': {
      'pt': 'Bem-vindo!',
      'en': 'Welcome!',
      'es': '¡Bienvenido!',
    },
    '837s72y1': {
      'pt': 'Faça seu login na plataforma para acessar o painel.',
      'en': 'Log in to the platform to access the dashboard.',
      'es': 'Inicie sesión en la plataforma para acceder al panel de control.',
    },
    'egftmz43': {
      'pt': 'Email',
      'en': 'E-mail',
      'es': 'Correo electrónico',
    },
    '0ogyfh4q': {
      'pt': '',
      'en': '',
      'es': '',
    },
    '6l3kuve3': {
      'pt': 'seu@email.com',
      'en': 'your@email.com',
      'es': 'tu@correoelectrónico.com',
    },
    '7qrpcfjq': {
      'pt': 'Senha',
      'en': 'Password',
      'es': 'Contraseña',
    },
    '8rvvqccs': {
      'pt': '',
      'en': '',
      'es': '',
    },
    'sxt4xsk7': {
      'pt': '**********',
      'en': '**********',
      'es': '**********',
    },
    '0j0ugtip': {
      'pt': 'Esqueci minha senha',
      'en': 'I forgot my password.',
      'es': 'Olvidé mi contraseña.',
    },
    '730qudef': {
      'pt': 'Fazer Login',
      'en': 'Log in',
      'es': 'Acceso',
    },
    '33j7y120': {
      'pt': 'Erro!',
      'en': 'Error!',
      'es': '¡Error!',
    },
    'mg7p9wud': {
      'pt': 'Erro!',
      'en': 'Error!',
      'es': '¡Error!',
    },
    'cbzqxs5u': {
      'pt': 'Ainda não tem uma conta? ',
      'en': 'Don\'t have an account yet? ',
      'es': '¿Aún no tienes una cuenta? ',
    },
    'bppyaxpp': {
      'pt': 'Cadastre-se aqui',
      'en': 'Register here',
      'es': 'Regístrate aquí',
    },
    '65uj4imi': {
      'pt': 'O e-mail é obrigatório',
      'en': 'Email is required.',
      'es': 'Se requiere correo electrónico.',
    },
    '82ktgfta': {
      'pt': 'Please choose an option from the dropdown',
      'en': 'Please choose an option from the dropdown',
      'es': 'Por favor, elija una opción del menú desplegable.',
    },
    'y7dvyoqc': {
      'pt': 'A senhal é obrigatório',
      'en': 'A password is required.',
      'es': 'Se requiere una contraseña.',
    },
    'v1f8anlb': {
      'pt': 'Please choose an option from the dropdown',
      'en': 'Please choose an option from the dropdown',
      'es': 'Por favor, elija una opción del menú desplegable.',
    },
    'md4b4go1': {
      'pt': 'Home',
      'en': 'Home',
      'es': 'Hogar',
    },
  },
  // Modulos
  {
    'kvh61m0j': {
      'pt': 'Módulos',
      'en': 'Modules',
      'es': 'Módulos',
    },
    '2uzvzjf5': {
      'pt':
          'Veja todos os módulos cadastrados, pesquise por fabricante ou tipo e cadastre um novo módulo',
      'en':
          'View all registered modules, search by manufacturer or type, and register a new module.',
      'es':
          'Ver todos los módulos registrados, buscar por fabricante o tipo y registrar un nuevo módulo.',
    },
    'd9tkjd1n': {
      'pt': 'Procurar por fabricante ou tipo de módulo',
      'en': 'Search by manufacturer or module type',
      'es': 'Buscar por fabricante o tipo de módulo',
    },
    'ug7iva9x': {
      'pt': 'Limpar',
      'en': 'To clean',
      'es': 'Para limpiar',
    },
    '6hkjlhfi': {
      'pt': 'Cadastrar novo módulo',
      'en': 'Register new module',
      'es': 'Registrar nuevo módulo',
    },
    '2hw4ju6y': {
      'pt': 'Fabricante',
      'en': 'Manufacturer',
      'es': 'Fabricante',
    },
    'jxbcd05o': {
      'pt': 'Modelo',
      'en': 'Model',
      'es': 'Modelo',
    },
    'xo5kgnv6': {
      'pt': 'Tensão',
      'en': 'Voltage',
      'es': 'Voltaje',
    },
    '6sincywb': {
      'pt': 'Corrente',
      'en': 'Current',
      'es': 'Actual',
    },
    '6gto9t3z': {
      'pt': 'Corrente de  curto circuito',
      'en': 'Short circuit current',
      'es': 'Corriente de cortocircuito',
    },
    '17dusqk1': {
      'pt': 'Potência',
      'en': 'Power',
      'es': 'Fuerza',
    },
    'nj8b08zn': {
      'pt': 'VCO',
      'en': 'VCO',
      'es': 'VCO',
    },
    'ak2e0ha8': {
      'pt': 'IM',
      'en': 'IM',
      'es': 'SOY',
    },
    'z954udzy': {
      'pt': 'VM',
      'en': 'VM',
      'es': 'Máquina virtual',
    },
    '96gayqtx': {
      'pt': 'Ações',
      'en': 'Actions',
      'es': 'Comportamiento',
    },
    'd133aq2j': {
      'pt': 'linhas por página:',
      'en': 'lines per page:',
      'es': 'líneas por página:',
    },
    'qc8yv0i5': {
      'pt': '10',
      'en': '10',
      'es': '10',
    },
    'tfbm20m2': {
      'pt': 'Search...',
      'en': 'Search...',
      'es': 'Buscar...',
    },
    '2yz6kkwe': {
      'pt': '5',
      'en': '5',
      'es': '5',
    },
    'u5jxcnio': {
      'pt': '10',
      'en': '10',
      'es': '10',
    },
    'a1jp6bt8': {
      'pt': '15',
      'en': '15',
      'es': '15',
    },
    '9r4czgrp': {
      'pt': '20',
      'en': '20',
      'es': '20',
    },
    '1bh3lfep': {
      'pt': '100',
      'en': '100',
      'es': '100',
    },
    'bg72wn7d': {
      'pt': 'Home',
      'en': 'Home',
      'es': 'Hogar',
    },
  },
  // Trackers
  {
    '41qgi3kx': {
      'pt': 'Trackers',
      'en': 'Trackers',
      'es': 'Rastreadores',
    },
    'ehksobaw': {
      'pt':
          'Veja todos os trackers cadastrados, pesquise por fabricante ou tipo e cadastre um novo tracker',
      'en':
          'View all registered trackers, search by manufacturer or type, and register a new tracker.',
      'es':
          'Vea todos los rastreadores registrados, busque por fabricante o tipo y registre un nuevo rastreador.',
    },
    'ssz9vdn2': {
      'pt': 'Procurar por fabricante, tipo de tracker',
      'en': 'Search by manufacturer, tracker type',
      'es': 'Búsqueda por fabricante, tipo de rastreador',
    },
    '2o60k2zg': {
      'pt': 'Limpar',
      'en': 'To clean',
      'es': 'Para limpiar',
    },
    'n2d7cqvw': {
      'pt': 'Cadastrar novo tracker',
      'en': 'Register a new tracker',
      'es': 'Registrar un nuevo rastreador',
    },
    'suy7as5u': {
      'pt': 'Fabricante',
      'en': 'Manufacturer',
      'es': 'Fabricante',
    },
    'z8j2vkbo': {
      'pt': 'Tipo de tracker',
      'en': 'Tracker type',
      'es': 'Tipo de rastreador',
    },
    'vgnib78u': {
      'pt': 'Quantidade de estaca',
      'en': 'Number of stakes',
      'es': 'Número de participaciones',
    },
    'pd7scu44': {
      'pt': 'Quantidade máxima de módulos',
      'en': 'Maximum number of modules',
      'es': 'Número máximo de módulos',
    },
    '1g1y9rr9': {
      'pt': 'Ações',
      'en': 'Actions',
      'es': 'Comportamiento',
    },
    'n7prpdjn': {
      'pt': 'linhas por página:',
      'en': 'lines per page:',
      'es': 'líneas por página:',
    },
    'usgpblyi': {
      'pt': '10',
      'en': '10',
      'es': '10',
    },
    'q9qsg57r': {
      'pt': '10',
      'en': '10',
      'es': '10',
    },
    '8epr8o0j': {
      'pt': 'Search...',
      'en': 'Search...',
      'es': 'Buscar...',
    },
    'rjun8f84': {
      'pt': '5',
      'en': '5',
      'es': '5',
    },
    'giwmzf3b': {
      'pt': '10',
      'en': '10',
      'es': '10',
    },
    'kaeqtzcx': {
      'pt': '15',
      'en': '15',
      'es': '15',
    },
    'yu1dtjrw': {
      'pt': '20',
      'en': '20',
      'es': '20',
    },
    'knbqx93z': {
      'pt': 'Home',
      'en': 'Home',
      'es': 'Hogar',
    },
  },
  // Estoque
  {
    'avys37rf': {
      'pt': 'Projetos',
      'en': 'Projects',
      'es': 'Proyectos',
    },
    'ye2n7xo8': {
      'pt': 'Controle de estoque',
      'en': 'Inventory control',
      'es': 'Control de inventario',
    },
    '3iyzy94g': {
      'pt': 'Controle de Estoque',
      'en': 'Inventory Control',
      'es': 'Control de inventario',
    },
    '3f4y108v': {
      'pt':
          'Gerencie o estoque de trackers, estacas, módulos solares e acessórios em tempo real. Acompanhe quantidades, locais de armazenamento e status de disponibilidade para manter o controle total dos materiais da obra.',
      'en':
          'Manage your inventory of trackers, stakes, solar modules, and accessories in real time. Track quantities, storage locations, and availability status to maintain complete control over construction materials.',
      'es':
          'Gestione su inventario de seguidores, estacas, módulos solares y accesorios en tiempo real. Controle las cantidades, las ubicaciones de almacenamiento y la disponibilidad para mantener un control total sobre los materiales de construcción.',
    },
    '20969i3r': {
      'pt': 'Total de Itens',
      'en': 'Total Items',
      'es': 'Total de artículos',
    },
    'zb2gycy1': {
      'pt': 'Estoque Baixo',
      'en': 'Low Stock',
      'es': 'Stock bajo',
    },
    'j8mmoamf': {
      'pt': 'Fora de Estoque',
      'en': 'Out of Stock',
      'es': 'Agotado',
    },
    'v43yr934': {
      'pt': 'Necessita reposição',
      'en': 'Needs replacement',
      'es': 'Necesita reemplazo',
    },
    'n7zo0t5f': {
      'pt': 'Filtros',
      'en': 'Filters',
      'es': 'Filtros',
    },
    'vf1njl1p': {
      'pt': 'Buscar por código, produto ou categoria',
      'en': 'Search by code, product, or category.',
      'es': 'Buscar por código, producto o categoría.',
    },
    'wv4bpruj': {
      'pt': 'Filtrar por Categoria',
      'en': 'Filter by Category',
      'es': 'Filtrar por categoría',
    },
    'uxo87ww3': {
      'pt': 'Filtrar por Status',
      'en': 'Filter by Status',
      'es': 'Filtrar por estado',
    },
    'o7dwzsw6': {
      'pt': 'Exportar Produtos',
      'en': 'Export Products',
      'es': 'Productos de exportación',
    },
    'ubotx2rq': {
      'pt': 'Exporte todos os produtos do seu estoque',
      'en': 'Export all products from your inventory.',
      'es': 'Exporta todos los productos de tu inventario.',
    },
    'z04789w8': {
      'pt': 'Adicionar Produto',
      'en': 'Add Product',
      'es': 'Agregar producto',
    },
    '6i44851a': {
      'pt': 'Código',
      'en': 'Code',
      'es': 'Código',
    },
    'ivcnm96a': {
      'pt': 'Produto',
      'en': 'Product',
      'es': 'Producto',
    },
    'aous7ru5': {
      'pt': 'Fabricante',
      'en': 'Manufacturer',
      'es': 'Fabricante',
    },
    'somxypz7': {
      'pt': 'Categoria',
      'en': 'Category',
      'es': 'Categoría',
    },
    'odzzq74a': {
      'pt': 'Especificações',
      'en': 'Specifications',
      'es': 'Presupuesto',
    },
    '0v2w0gyl': {
      'pt': 'Estoque',
      'en': 'Stock',
      'es': 'Existencias',
    },
    'ma9gms4l': {
      'pt': 'Unidade/Medida',
      'en': 'Unit/Measurement',
      'es': 'Unidad/Medida',
    },
    '0l349xyi': {
      'pt': 'Status',
      'en': 'Status',
      'es': 'Estado',
    },
    '8ujd8j8i': {
      'pt': 'Ações',
      'en': 'Actions',
      'es': 'Comportamiento',
    },
    '4eqacc87': {
      'pt': 'linhas por página:',
      'en': 'lines per page:',
      'es': 'líneas por página:',
    },
    's72esubr': {
      'pt': '10',
      'en': '10',
      'es': '10',
    },
    'p5ay9rl6': {
      'pt': 'Search...',
      'en': 'Search...',
      'es': 'Buscar...',
    },
    'ejc1vte2': {
      'pt': '5',
      'en': '5',
      'es': '5',
    },
    'l1lbhp80': {
      'pt': '10',
      'en': '10',
      'es': '10',
    },
    'ajaesqd9': {
      'pt': '15',
      'en': '15',
      'es': '15',
    },
    'p4do6d2x': {
      'pt': '20',
      'en': '20',
      'es': '20',
    },
    'dtbn12f1': {
      'pt': '100',
      'en': '100',
      'es': '100',
    },
    'fc17ks8y': {
      'pt': 'Home',
      'en': 'Home',
      'es': 'Hogar',
    },
  },
  // EditarProjeto
  {
    'xwp7936h': {
      'pt': 'Projetos',
      'en': 'Projects',
      'es': 'Proyectos',
    },
    '4tyg30gt': {
      'pt': 'Informações principais da obra',
      'en': 'Key information about the work',
      'es': 'Información clave sobre la obra',
    },
    'qsrusu2g': {
      'pt': 'Editar projeto',
      'en': 'Edit project',
      'es': 'Editar proyecto',
    },
    'xrctxs9l': {
      'pt': 'CNO - Cadastro Nacional de Obras',
      'en': 'CNO - National Registry of Works',
      'es': 'CNO - Registro Nacional de Obras',
    },
    '1vscobp7': {
      'pt': 'Que tal começar fazendo upload do documento?',
      'en': 'How about starting by uploading the document?',
      'es': '¿Qué tal empezar subiendo el documento?',
    },
    'ktkfrqzd': {
      'pt': 'Faça upload do documento CNO - Cadastro Nacional de Obras',
      'en': 'Upload the CNO document - National Registry of Works.',
      'es': 'Cargar el documento CNO – Registro Nacional de Obras.',
    },
    'twgf2629': {
      'pt': 'Upload de um novo documento CNO',
      'en': 'Upload a new CNO document.',
      'es': 'Subir un nuevo documento CNO.',
    },
    'zwuu3sis': {
      'pt': 'Informações da obra',
      'en': 'Information about the work',
      'es': 'Información sobre la obra',
    },
    '05g7jftu': {
      'pt':
          'Você pode checar se as informações foram preenchidas, editá-las ou acrescentar o que faltou.',
      'en':
          'You can check if the information has been filled in, edit it, or add anything that is missing.',
      'es':
          'Podrás comprobar si la información se ha completado, editarla o añadir aquello que falte.',
    },
    '3c65w60j': {
      'pt': 'Número de inscrição do projeto',
      'en': 'Project registration number',
      'es': 'Número de registro del proyecto',
    },
    'a5jazpcn': {
      'pt': 'Digite aqui',
      'en': 'Type here',
      'es': 'Escribe aquí',
    },
    'hwwi2uzl': {
      'pt': 'Nome da obra',
      'en': 'Title of the work',
      'es': 'Título de la obra',
    },
    'dsvulq03': {
      'pt': 'Digite aqui',
      'en': 'Type here',
      'es': 'Escribe aquí',
    },
    'ub5advon': {
      'pt': 'Origem do cadastramento',
      'en': 'Origin of registration',
      'es': 'Origen del registro',
    },
    'r7ljzhuk': {
      'pt': 'Digite aqui',
      'en': 'Type here',
      'es': 'Escribe aquí',
    },
    '85rl5hi5': {
      'pt': 'ART',
      'en': 'ART',
      'es': 'ARTE',
    },
    'pc82865d': {
      'pt': 'Digite aqui',
      'en': 'Type here',
      'es': 'Escribe aquí',
    },
    '019s4qsf': {
      'pt': 'RRT',
      'en': 'RRT',
      'es': 'TRR',
    },
    'e5c1w8mq': {
      'pt': 'Digite aqui',
      'en': 'Type here',
      'es': 'Escribe aquí',
    },
    '0j8ejfp0': {
      'pt': 'CIB',
      'en': 'CIB',
      'es': 'CIB',
    },
    'zbshwnad': {
      'pt': 'Digite aqui',
      'en': 'Type here',
      'es': 'Escribe aquí',
    },
    '7ae7zzv1': {
      'pt': 'Cadastro imobiliário',
      'en': 'Real estate registry',
      'es': 'Registro de la propiedad inmobiliaria',
    },
    'dtddrs55': {
      'pt': 'Digite aqui',
      'en': 'Type here',
      'es': 'Escribe aquí',
    },
    '18r2rsmx': {
      'pt': 'Data do início da obra',
      'en': 'Start date of construction',
      'es': 'Fecha de inicio de la construcción',
    },
    '4wfnolf2': {
      'pt': 'XX/XX/XXXX',
      'en': 'XX/XX/XXXX',
      'es': 'XX/XX/XXXX',
    },
    'xtqlhsz3': {
      'pt': 'CNAE',
      'en': 'CNAE',
      'es': 'CNAE',
    },
    '3vt8qyrp': {
      'pt': 'Digite aqui',
      'en': 'Type here',
      'es': 'Escribe aquí',
    },
    'jv4s4i2n': {
      'pt': 'Alvará',
      'en': 'License',
      'es': 'Licencia',
    },
    'rsc9cxgq': {
      'pt':
          'Você pode checar se as informações foram preenchidas automaticamente, editá-las ou acrescentar o que faltou.',
      'en':
          'You can check if the information was automatically filled in, edit it, or add anything that was missing.',
      'es':
          'Puedes comprobar si la información se completó automáticamente, editarla o agregar cualquier cosa que faltara.',
    },
    'kpifftld': {
      'pt': 'Número do alvará',
      'en': 'License number',
      'es': 'Número de licencia',
    },
    '4p81s5xr': {
      'pt': 'Digite aqui',
      'en': 'Type here',
      'es': 'Escribe aquí',
    },
    'kta0ary8': {
      'pt': 'Situação da obra',
      'en': 'Project status',
      'es': 'Estado del proyecto',
    },
    'yr0najn3': {
      'pt':
          'Você pode checar se as informações foram preenchidas automaticamente, editá-las ou acrescentar o que faltou.',
      'en':
          'You can check if the information was automatically filled in, edit it, or add anything that was missing.',
      'es':
          'Puedes comprobar si la información se completó automáticamente, editarla o agregar cualquier cosa que faltara.',
    },
    'nw4y31rt': {
      'pt': 'Situação',
      'en': 'Situation',
      'es': 'Situación',
    },
    '05lpsavf': {
      'pt': 'Selecione uma opção',
      'en': 'Select an option',
      'es': 'Seleccione una opción',
    },
    'xtp4h64x': {
      'pt': 'Search...',
      'en': 'Search...',
      'es': 'Buscar...',
    },
    '5o74qrf7': {
      'pt': 'Data',
      'en': 'Date',
      'es': 'Fecha',
    },
    'a3qvx9ou': {
      'pt': 'XX/XX/XXXX',
      'en': 'XX/XX/XXXX',
      'es': 'XX/XX/XXXX',
    },
    'rr0sao1v': {
      'pt': 'Responsável',
      'en': 'Responsible',
      'es': 'Responsable',
    },
    'wtai1x9j': {
      'pt':
          'Você pode checar se as informações foram preenchidas automaticamente, editá-las ou acrescentar o que faltou.',
      'en':
          'You can check if the information was automatically filled in, edit it, or add anything that was missing.',
      'es':
          'Puedes comprobar si la información se completó automáticamente, editarla o agregar cualquier cosa que faltara.',
    },
    'ubw2xsvz': {
      'pt': 'Responsável',
      'en': 'Responsible',
      'es': 'Responsable',
    },
    'ltyuu4oq': {
      'pt': 'CPF/CNPJ',
      'en': 'CPF/CNPJ',
      'es': 'CPF/CNPJ',
    },
    '64y2rhta': {
      'pt': 'Digite aqui',
      'en': 'Type here',
      'es': 'Escribe aquí',
    },
    '9t24612d': {
      'pt': 'Digite aqui',
      'en': 'Type here',
      'es': 'Escribe aquí',
    },
    'rwkk4bfm': {
      'pt': 'Endereço',
      'en': 'Address',
      'es': 'DIRECCIÓN',
    },
    'nssp4ecy': {
      'pt':
          'Você pode checar se as informações foram preenchidas automaticamente, editá-las ou acrescentar o que faltou.',
      'en':
          'You can check if the information was automatically filled in, edit it, or add anything that was missing.',
      'es':
          'Puedes comprobar si la información se completó automáticamente, editarla o agregar cualquier cosa que faltara.',
    },
    '73c3trk8': {
      'pt': 'CEP',
      'en': 'ZIP code',
      'es': 'Código postal',
    },
    '0rzkoj1i': {
      'pt': 'Digite aqui',
      'en': 'Type here',
      'es': 'Escribe aquí',
    },
    'beog0wj8': {
      'pt': 'Logradouro',
      'en': 'Street',
      'es': 'Calle',
    },
    'b4rqnsbn': {
      'pt': 'Digite aqui',
      'en': 'Type here',
      'es': 'Escribe aquí',
    },
    'w46xow7v': {
      'pt': 'Número',
      'en': 'Number',
      'es': 'Número',
    },
    '1p9uokkv': {
      'pt': 'Digite aqui',
      'en': 'Type here',
      'es': 'Escribe aquí',
    },
    'j83yf7hp': {
      'pt': 'Bairro',
      'en': 'Neighborhood',
      'es': 'Vecindario',
    },
    'ba7mrxwb': {
      'pt': 'Digite aqui',
      'en': 'Type here',
      'es': 'Escribe aquí',
    },
    '7ee7ewnd': {
      'pt': 'Município',
      'en': 'Municipality',
      'es': 'Municipio',
    },
    '9umwp08f': {
      'pt': 'Digite aqui',
      'en': 'Type here',
      'es': 'Escribe aquí',
    },
    'oivpeeks': {
      'pt': 'UF',
      'en': 'UF',
      'es': 'UF',
    },
    't2ryizst': {
      'pt': 'Digite aqui',
      'en': 'Type here',
      'es': 'Escribe aquí',
    },
    'tj0s4nn5': {
      'pt': 'País',
      'en': 'Country',
      'es': 'País',
    },
    'ymvrt63e': {
      'pt': 'Digite aqui',
      'en': 'Type here',
      'es': 'Escribe aquí',
    },
    'skg6bmvq': {
      'pt': 'Complemento',
      'en': 'Supplement',
      'es': 'Suplemento',
    },
    'vnmb26g4': {
      'pt': 'Digite aqui',
      'en': 'Type here',
      'es': 'Escribe aquí',
    },
    '38wcyety': {
      'pt': 'Áreas principais',
      'en': 'Main areas',
      'es': 'Áreas principales',
    },
    'a4ijfffo': {
      'pt':
          'Você pode checar se as informações foram preenchidas automaticamente, editá-las ou acrescentar o que faltou.',
      'en':
          'You can check if the information was automatically filled in, edit it, or add anything that was missing.',
      'es':
          'Puedes comprobar si la información se completó automáticamente, editarla o agregar cualquier cosa que faltara.',
    },
    '66prpa5c': {
      'pt': 'Categoria',
      'en': 'Category',
      'es': 'Categoría',
    },
    'au88xf73': {
      'pt': 'Digite aqui',
      'en': 'Type here',
      'es': 'Escribe aquí',
    },
    'w5jb1z8r': {
      'pt': 'Destinação',
      'en': 'Destination',
      'es': 'Destino',
    },
    '5lwrniv0': {
      'pt': 'Digite aqui',
      'en': 'Type here',
      'es': 'Escribe aquí',
    },
    '2m9xy7n1': {
      'pt': 'Tipo de obra',
      'en': 'Type of work',
      'es': 'Tipo de trabajo',
    },
    'gs1qrlkh': {
      'pt': 'Digite aqui',
      'en': 'Type here',
      'es': 'Escribe aquí',
    },
    'vm25pj3u': {
      'pt': 'Área resultante da obra',
      'en': 'Area resulting from the work',
      'es': 'Área resultante de la obra',
    },
    'xlr6xepb': {
      'pt': 'Digite aqui',
      'en': 'Type here',
      'es': 'Escribe aquí',
    },
    'v4lx3gs4': {
      'pt': 'Editar projeto',
      'en': 'Edit project',
      'es': 'Editar proyecto',
    },
    'lshrug6y': {
      'pt': 'Erro!',
      'en': 'Error!',
      'es': '¡Error!',
    },
    '1nrnvj02': {
      'pt': '*Campo obrigatório',
      'en': '*Required field',
      'es': '*Campo obligatorio',
    },
    'gxvr7d1h': {
      'pt': 'Please choose an option from the dropdown',
      'en': 'Please choose an option from the dropdown',
      'es': 'Por favor, elija una opción del menú desplegable.',
    },
    'dizaewgo': {
      'pt': '*Campo obrigatório',
      'en': '*Required field',
      'es': '*Campo obligatorio',
    },
    'hswvcbw1': {
      'pt': 'Please choose an option from the dropdown',
      'en': 'Please choose an option from the dropdown',
      'es': 'Por favor, elija una opción del menú desplegable.',
    },
    'sl3eg8o5': {
      'pt': '*Campo obrigatório',
      'en': '*Required field',
      'es': '*Campo obligatorio',
    },
    'y4dagi2i': {
      'pt': 'Please choose an option from the dropdown',
      'en': 'Please choose an option from the dropdown',
      'es': 'Por favor, elija una opción del menú desplegable.',
    },
    'je4kjoqg': {
      'pt': '*Campo obrigatório',
      'en': '*Required field',
      'es': '*Campo obligatorio',
    },
    'y3vtbwwq': {
      'pt': 'Please choose an option from the dropdown',
      'en': 'Please choose an option from the dropdown',
      'es': 'Por favor, elija una opción del menú desplegable.',
    },
    'qpnz2req': {
      'pt': '*Campo obrigatório',
      'en': '*Required field',
      'es': '*Campo obligatorio',
    },
    'trazbwyt': {
      'pt': 'Please choose an option from the dropdown',
      'en': 'Please choose an option from the dropdown',
      'es': 'Por favor, elija una opción del menú desplegable.',
    },
    't8wji87v': {
      'pt': '*Campo obrigatório',
      'en': '*Required field',
      'es': '*Campo obligatorio',
    },
    'e3q9wu3p': {
      'pt': 'Please choose an option from the dropdown',
      'en': 'Please choose an option from the dropdown',
      'es': 'Por favor, elija una opción del menú desplegable.',
    },
    'y2qcqpua': {
      'pt': '*Campo obrigatório',
      'en': '*Required field',
      'es': '*Campo obligatorio',
    },
    '9uebk2tv': {
      'pt': 'Please choose an option from the dropdown',
      'en': 'Please choose an option from the dropdown',
      'es': 'Por favor, elija una opción del menú desplegable.',
    },
    'nb3dovgq': {
      'pt': '*Campo obrigatório',
      'en': '*Required field',
      'es': '*Campo obligatorio',
    },
    '6rh2v2ev': {
      'pt': 'Please choose an option from the dropdown',
      'en': 'Please choose an option from the dropdown',
      'es': 'Por favor, elija una opción del menú desplegable.',
    },
    'pu1uwldb': {
      'pt': '*Campo obrigatório',
      'en': '*Required field',
      'es': '*Campo obligatorio',
    },
    'oxjhidbu': {
      'pt': 'Please choose an option from the dropdown',
      'en': 'Please choose an option from the dropdown',
      'es': 'Por favor, elija una opción del menú desplegable.',
    },
    '1uco46u0': {
      'pt': '*Campo obrigatório',
      'en': '*Required field',
      'es': '*Campo obligatorio',
    },
    '3svh5ckq': {
      'pt': 'Please choose an option from the dropdown',
      'en': 'Please choose an option from the dropdown',
      'es': 'Por favor, elija una opción del menú desplegable.',
    },
    'nf9ai88d': {
      'pt': '*Campo obrigatório',
      'en': '*Required field',
      'es': '*Campo obligatorio',
    },
    '97k9ykn5': {
      'pt': 'Please choose an option from the dropdown',
      'en': 'Please choose an option from the dropdown',
      'es': 'Por favor, elija una opción del menú desplegable.',
    },
    'foac9aa3': {
      'pt': '*Campo obrigatório',
      'en': '*Required field',
      'es': '*Campo obligatorio',
    },
    'wezadphj': {
      'pt': 'Please choose an option from the dropdown',
      'en': 'Please choose an option from the dropdown',
      'es': 'Por favor, elija una opción del menú desplegable.',
    },
    '3xzle3jp': {
      'pt': '*Campo obrigatório',
      'en': '*Required field',
      'es': '*Campo obligatorio',
    },
    'nsp4d6fo': {
      'pt': 'Please choose an option from the dropdown',
      'en': 'Please choose an option from the dropdown',
      'es': 'Por favor, elija una opción del menú desplegable.',
    },
    'hznrz88h': {
      'pt': '*Campo obrigatório',
      'en': '*Required field',
      'es': '*Campo obligatorio',
    },
    'bg1px315': {
      'pt': 'Please choose an option from the dropdown',
      'en': 'Please choose an option from the dropdown',
      'es': 'Por favor, elija una opción del menú desplegable.',
    },
    '7febgyxf': {
      'pt': '*Campo obrigatório',
      'en': '*Required field',
      'es': '*Campo obligatorio',
    },
    'v2q8o8ac': {
      'pt': 'Please choose an option from the dropdown',
      'en': 'Please choose an option from the dropdown',
      'es': 'Por favor, elija una opción del menú desplegable.',
    },
    'g7bffwq0': {
      'pt': '*Campo obrigatório',
      'en': '*Required field',
      'es': '*Campo obligatorio',
    },
    '82w0duwh': {
      'pt': 'Please choose an option from the dropdown',
      'en': 'Please choose an option from the dropdown',
      'es': 'Por favor, elija una opción del menú desplegable.',
    },
    'skooa9d9': {
      'pt': '*Campo obrigatório',
      'en': '*Required field',
      'es': '*Campo obligatorio',
    },
    'wseof1ve': {
      'pt': 'Please choose an option from the dropdown',
      'en': 'Please choose an option from the dropdown',
      'es': 'Por favor, elija una opción del menú desplegable.',
    },
    '8ewjd8vv': {
      'pt': '*Campo obrigatório',
      'en': '*Required field',
      'es': '*Campo obligatorio',
    },
    'mnwhkp4x': {
      'pt': 'Please choose an option from the dropdown',
      'en': 'Please choose an option from the dropdown',
      'es': 'Por favor, elija una opción del menú desplegable.',
    },
    'dlxio2hm': {
      'pt': '*Campo obrigatório',
      'en': '*Required field',
      'es': '*Campo obligatorio',
    },
    'lb61il44': {
      'pt': 'Please choose an option from the dropdown',
      'en': 'Please choose an option from the dropdown',
      'es': 'Por favor, elija una opción del menú desplegable.',
    },
    'b9f2bh9z': {
      'pt': '*Campo obrigatório',
      'en': '*Required field',
      'es': '*Campo obligatorio',
    },
    'x7a6xog8': {
      'pt': 'Please choose an option from the dropdown',
      'en': 'Please choose an option from the dropdown',
      'es': 'Por favor, elija una opción del menú desplegable.',
    },
    's83o7ln9': {
      'pt': '*Campo obrigatório',
      'en': '*Required field',
      'es': '*Campo obligatorio',
    },
    'iyvxmd95': {
      'pt': 'Please choose an option from the dropdown',
      'en': 'Please choose an option from the dropdown',
      'es': 'Por favor, elija una opción del menú desplegable.',
    },
    's8g9jq13': {
      'pt': '*Campo obrigatório',
      'en': '*Required field',
      'es': '*Campo obligatorio',
    },
    'i023n1bm': {
      'pt': 'Please choose an option from the dropdown',
      'en': 'Please choose an option from the dropdown',
      'es': 'Por favor, elija una opción del menú desplegable.',
    },
    'nw2lj2rh': {
      'pt': 'Digite aqui is required',
      'en': 'Type here is required',
      'es': 'El tipo aquí es obligatorio',
    },
    '77zwdsct': {
      'pt': 'Please choose an option from the dropdown',
      'en': 'Please choose an option from the dropdown',
      'es': 'Por favor, elija una opción del menú desplegable.',
    },
    '3rhxcmyx': {
      'pt': '*Campo obrigatório',
      'en': '*Required field',
      'es': '*Campo obligatorio',
    },
    '2ji8snq7': {
      'pt': 'Please choose an option from the dropdown',
      'en': 'Please choose an option from the dropdown',
      'es': 'Por favor, elija una opción del menú desplegable.',
    },
    'cjagj09v': {
      'pt': '*Campo obrigatório',
      'en': '*Required field',
      'es': '*Campo obligatorio',
    },
    'viprd1iq': {
      'pt': 'Please choose an option from the dropdown',
      'en': 'Please choose an option from the dropdown',
      'es': 'Por favor, elija una opción del menú desplegable.',
    },
    'a842v4hc': {
      'pt': '*Campo obrigatório',
      'en': '*Required field',
      'es': '*Campo obligatorio',
    },
    'ovre1oon': {
      'pt': 'Please choose an option from the dropdown',
      'en': 'Please choose an option from the dropdown',
      'es': 'Por favor, elija una opción del menú desplegable.',
    },
    'fvav501x': {
      'pt': '*Campo obrigatório',
      'en': '*Required field',
      'es': '*Campo obligatorio',
    },
    'p8ujala8': {
      'pt': 'Please choose an option from the dropdown',
      'en': 'Please choose an option from the dropdown',
      'es': 'Por favor, elija una opción del menú desplegable.',
    },
    'd3g3rc7n': {
      'pt': 'Home',
      'en': 'Home',
      'es': 'Hogar',
    },
  },
  // Projeto-Detalhes
  {
    'lnkstgn9': {
      'pt': 'Projetos',
      'en': 'Projects',
      'es': 'Proyectos',
    },
    '0wl4gpcy': {
      'pt': 'Aqui você pode acessar todos os parques solares.',
      'en': 'Here you can access all the solar parks.',
      'es': 'Aquí podrás acceder a todos los parques solares.',
    },
    'ndbavi8w': {
      'pt': 'Informações principais da obra',
      'en': 'Key information about the work',
      'es': 'Información clave sobre la obra',
    },
    'supflv2k': {
      'pt':
          'Verifique e edite todas as informações do CNO - Cadastro Nacional de Obras.',
      'en':
          'Verify and edit all information in the CNO - National Registry of Works.',
      'es':
          'Verificar y editar toda la información en el CNO - Registro Nacional de Obras.',
    },
    'pglhu6p4': {
      'pt': 'Mapa de trackers',
      'en': 'Tracker map',
      'es': 'Mapa de seguimiento',
    },
    '5qol2dzd': {
      'pt':
          'Verifique e edite todos os módulos e trackers que compõem esse projeto.',
      'en':
          'Check and edit all the modules and trackers that make up this project.',
      'es':
          'Revisa y edita todos los módulos y rastreadores que componen este proyecto.',
    },
    'u1wfk9pn': {
      'pt': 'Backlog de tarefas',
      'en': 'Task backlog',
      'es': 'Atraso de tareas',
    },
    '69ievho2': {
      'pt':
          'Aqui você pode adicionar tarefas da plataforma ao backlog do projeto e ver como elas se dividem por tracker, estacas e módulos.',
      'en':
          'Here you can add tasks from the platform to the project backlog and see how they are divided by tracker, stakes, and modules.',
      'es':
          'Aquí puedes agregar tareas desde la plataforma al backlog del proyecto y ver cómo están divididas por rastreador, apuestas y módulos.',
    },
    'vhiu0qpq': {
      'pt': 'Gestão de equipes',
      'en': 'Team management',
      'es': 'Gestión de equipos',
    },
    'pq9hap46': {
      'pt':
          'Nesta área você pode gerir sua equipe. Defina quais são os colaboradores responsáveis por cada cargo dentro do projeto.',
      'en':
          'In this area you can manage your team. Define which team members are responsible for each role within the project.',
      'es':
          'En esta área puedes gestionar a tu equipo. Define qué miembros del equipo son responsables de cada rol dentro del proyecto.',
    },
    'iwdi7ir5': {
      'pt': 'Gerenciar sprint',
      'en': 'Manage sprint',
      'es': 'Gestionar sprint',
    },
    '1hf2kx6r': {
      'pt':
          'Nessa seção você pode Criar uma nova sprint, visualizar as sprints anteriores e acessar a gestão de tarefas.',
      'en':
          'In this section you can create a new sprint, view previous sprints, and access task management.',
      'es':
          'En esta sección puedes crear un nuevo sprint, ver sprints anteriores y acceder a la gestión de tareas.',
    },
    'kybtr9tc': {
      'pt': 'Relatórios',
      'en': 'Reports',
      'es': 'Informes',
    },
    'h4ycj9nh': {
      'pt':
          'Veja os relatórios de produtividade baseados nas conclusões de tarefas da sprint.',
      'en': 'View productivity reports based on sprint task completions.',
      'es':
          'Vea informes de productividad basados ​​en las finalizaciones de tareas de sprint.',
    },
    'xv5penzi': {
      'pt': 'Informe diarias de produção',
      'en': 'Daily production reports',
      'es': 'Informes diarios de producción',
    },
    '8u97nu7y': {
      'pt': 'Veja todas informações diarias de produção',
      'en': 'View all daily production information',
      'es': 'Ver toda la información de producción diaria',
    },
    'wrzxo5ez': {
      'pt': 'Controle de Estoque',
      'en': 'Inventory Control',
      'es': 'Control de inventario',
    },
    'fmlcykkk': {
      'pt':
          'Gerencie o estoque em tempo real — quantidades, localização e disponibilidade de trackers, estacas, módulos e acessórios',
      'en':
          'Manage inventory in real time — quantities, location, and availability of trackers, stakes, modules, and accessories.',
      'es':
          'Administre el inventario en tiempo real: cantidades, ubicación y disponibilidad de rastreadores, estacas, módulos y accesorios.',
    },
    'x5wlagdo': {
      'pt': 'Home',
      'en': 'Home',
      'es': 'Hogar',
    },
  },
  // Cadastro
  {
    'vll9t61h': {
      'pt': 'Faça seu cadastro',
      'en': 'Register now!',
      'es': '¡Regístrate ahora!',
    },
    '399fn6he': {
      'pt':
          'Preencha todos os seus dados a baixo para poder acessar a aba da empresa.',
      'en': 'Please fill in all your details below to access the company tab.',
      'es':
          'Por favor, rellene todos sus datos a continuación para acceder a la pestaña de empresa.',
    },
    'dg081naa': {
      'pt': 'Nome',
      'en': 'Name',
      'es': 'Nombre',
    },
    'q74cnnnn': {
      'pt': '',
      'en': '',
      'es': '',
    },
    'hmei2dys': {
      'pt': 'João Pessoa',
      'en': 'John Person',
      'es': 'Juan Persona',
    },
    'qsfd9d5r': {
      'pt': 'Telefone',
      'en': 'Telephone',
      'es': 'Teléfono',
    },
    'ergut3pe': {
      'pt': '',
      'en': '',
      'es': '',
    },
    'tniior0o': {
      'pt': 'Telefone',
      'en': 'Telephone',
      'es': 'Teléfono',
    },
    '2b7yr9je': {
      'pt': 'Email',
      'en': 'E-mail',
      'es': 'Correo electrónico',
    },
    't7rrikrv': {
      'pt': '',
      'en': '',
      'es': '',
    },
    'flwfdc2l': {
      'pt': 'seu@email.com',
      'en': 'your@email.com',
      'es': 'tu@correoelectrónico.com',
    },
    '94rda4k7': {
      'pt': 'Senha',
      'en': 'Password',
      'es': 'Contraseña',
    },
    'o5natxs6': {
      'pt': '',
      'en': '',
      'es': '',
    },
    'ktzxriwa': {
      'pt': '*********************',
      'en': '*********************',
      'es': '*********************',
    },
    'fqdqn27t': {
      'pt': 'Sua senha está',
      'en': 'Your password is',
      'es': 'Tu contraseña es',
    },
    'ldtzlkev': {
      'pt': 'fraca',
      'en': 'weak',
      'es': 'débil',
    },
    '631uymom': {
      'pt': 'média',
      'en': 'average',
      'es': 'promedio',
    },
    '8x4no9b5': {
      'pt': 'forte',
      'en': 'strong',
      'es': 'fuerte',
    },
    '5t9ssz1a': {
      'pt': 'muito forte',
      'en': 'very strong',
      'es': 'acérrimo',
    },
    '48xyms4f': {
      'pt': 'Confirmar senha',
      'en': 'Confirm password',
      'es': 'Confirmar Contraseña',
    },
    'b59sxqxz': {
      'pt': '',
      'en': '',
      'es': '',
    },
    'elslz5jx': {
      'pt': '*********************',
      'en': '*********************',
      'es': '*********************',
    },
    'w67anxth': {
      'pt': 'As senhas não coincidem.',
      'en': 'The passwords don\'t match.',
      'es': 'Las contraseñas no coinciden.',
    },
    '5g7gungv': {
      'pt': 'Cadastrar emrpesa',
      'en': 'Register your company',
      'es': 'Registre su empresa',
    },
    'zd2gn86w': {
      'pt': 'Atenção!',
      'en': 'Attention!',
      'es': '¡Atención!',
    },
    'altbh7xu': {
      'pt': 'Revise sua senha, pois ela contém espaços, o que não é permitido.',
      'en':
          'Review your password, as it contains spaces, which are not allowed.',
      'es':
          'Revisa tu contraseña, ya que contiene espacios, los cuales no están permitidos.',
    },
    'k3691911': {
      'pt': '* Campo obrigatório',
      'en': '* Required field',
      'es': '* Campo obligatorio',
    },
    '865wsuh7': {
      'pt': 'Please choose an option from the dropdown',
      'en': 'Please choose an option from the dropdown',
      'es': 'Por favor, elija una opción del menú desplegable.',
    },
    'hnifvd6q': {
      'pt': '* Campo obrigatório',
      'en': '* Required field',
      'es': '* Campo obligatorio',
    },
    'ggiqj567': {
      'pt': 'Please choose an option from the dropdown',
      'en': 'Please choose an option from the dropdown',
      'es': 'Por favor, elija una opción del menú desplegable.',
    },
    '0hwpbmgw': {
      'pt': '* Campo obrigatório',
      'en': '* Required field',
      'es': '* Campo obligatorio',
    },
    'jdrpixrq': {
      'pt': 'Digite um email valido.',
      'en': 'Enter a valid email address.',
      'es': 'Introduzca una dirección de correo electrónico válida.',
    },
    '9s1uaocg': {
      'pt': 'Please choose an option from the dropdown',
      'en': 'Please choose an option from the dropdown',
      'es': 'Por favor, elija una opción del menú desplegable.',
    },
    'bacnhicl': {
      'pt': '* Campo obrigatório',
      'en': '* Required field',
      'es': '* Campo obligatorio',
    },
    '35z3aqbg': {
      'pt': 'Please choose an option from the dropdown',
      'en': 'Please choose an option from the dropdown',
      'es': 'Por favor, elija una opción del menú desplegable.',
    },
    '157gk7ux': {
      'pt': '* Campo obrigatório',
      'en': '* Required field',
      'es': '* Campo obligatorio',
    },
    'u1rvcz86': {
      'pt': 'Please choose an option from the dropdown',
      'en': 'Please choose an option from the dropdown',
      'es': 'Por favor, elija una opción del menú desplegable.',
    },
    '0k7fogrf': {
      'pt': 'Cadastro da empresa',
      'en': 'Company registration',
      'es': 'Registro de empresa',
    },
    '1sldovt4': {
      'pt':
          'Preencha todos os dados da empresa a baixo para poder acessar a plataforma.',
      'en':
          'Please fill in all the company details below to access the platform.',
      'es':
          'Por favor, rellene todos los datos de la empresa a continuación para acceder a la plataforma.',
    },
    'hb84i8t6': {
      'pt': 'Nome Fantasia',
      'en': 'Trade Name',
      'es': 'Nombre comercial',
    },
    'sc2iz5xb': {
      'pt': '',
      'en': '',
      'es': '',
    },
    'mr4pbtwg': {
      'pt': 'Ex: IndustriView',
      'en': 'Example: IndustriView',
      'es': 'Ejemplo: IndustriView',
    },
    'mody7t2n': {
      'pt': 'Razão Social',
      'en': 'Company Name',
      'es': 'nombre de empresa',
    },
    'h65x9s06': {
      'pt': '',
      'en': '',
      'es': '',
    },
    'seqi3fls': {
      'pt': 'Ex: IndustriView',
      'en': 'Example: IndustriView',
      'es': 'Ejemplo: IndustriView',
    },
    'qhm7psqx': {
      'pt': 'CNPJ',
      'en': 'CNPJ',
      'es': 'CNPJ',
    },
    'wj1jyqts': {
      'pt': '',
      'en': '',
      'es': '',
    },
    'bnwhssf5': {
      'pt': '12.345.678/9101-23',
      'en': '12.345.678/9101-23',
      'es': '12.345.678/9101-23',
    },
    'fw3yspm8': {
      'pt': 'Telefone da Empresa',
      'en': 'Company Phone Number',
      'es': 'Número de teléfono de la empresa',
    },
    '68jw5j1t': {
      'pt': '',
      'en': '',
      'es': '',
    },
    'lb0q88bw': {
      'pt': '(12) 3 4567-8910',
      'en': '(12) 3 4567-8910',
      'es': '(12) 3 4567-8910',
    },
    '12rhoi9v': {
      'pt': 'Email da Empresa',
      'en': 'Company Email',
      'es': 'Correo electrónico de la empresa',
    },
    'rzi5m8c3': {
      'pt': '',
      'en': '',
      'es': '',
    },
    'e280z9ym': {
      'pt': 'seu@email.com',
      'en': 'your@email.com',
      'es': 'tu@correoelectrónico.com',
    },
    '5ubvuklt': {
      'pt': 'CEP',
      'en': 'ZIP code',
      'es': 'Código postal',
    },
    'yi5h92go': {
      'pt': '',
      'en': '',
      'es': '',
    },
    'l5ek2ypq': {
      'pt': 'Ex: 12345-678',
      'en': 'Ex: 12345-678',
      'es': 'Ej: 12345-678',
    },
    'mf2sd3is': {
      'pt': 'Número',
      'en': 'Number',
      'es': 'Número',
    },
    'f6kakh8y': {
      'pt': '',
      'en': '',
      'es': '',
    },
    'mvo78xrp': {
      'pt': 'Ex: 88',
      'en': 'Ex: 88',
      'es': 'Ej: 88',
    },
    'wz8jsxar': {
      'pt': 'Logradouro',
      'en': 'Street',
      'es': 'Calle',
    },
    '744kdxv6': {
      'pt': '',
      'en': '',
      'es': '',
    },
    'giwjph5a': {
      'pt': 'Ex: Avenida Paulista',
      'en': 'Example: Paulista Avenue',
      'es': 'Ejemplo: Avenida Paulista',
    },
    'cmfgknqb': {
      'pt': 'Cidade',
      'en': 'City',
      'es': 'Ciudad',
    },
    'qhvw9km0': {
      'pt': '',
      'en': '',
      'es': '',
    },
    'wj63lmaq': {
      'pt': 'Ex: São paulo',
      'en': 'Example: São Paulo',
      'es': 'Ejemplo: São Paulo',
    },
    'qp2v3vs6': {
      'pt': 'UF',
      'en': 'UF',
      'es': 'UF',
    },
    'dhtrt6aq': {
      'pt': '',
      'en': '',
      'es': '',
    },
    'sx672nje': {
      'pt': 'Ex: SP',
      'en': 'Ex: SP',
      'es': 'Ej: SP',
    },
    'ict6cd6k': {
      'pt': 'Complemento',
      'en': 'Supplement',
      'es': 'Suplemento',
    },
    'e9m2r1u6': {
      'pt': '',
      'en': '',
      'es': '',
    },
    'kkbqfilc': {
      'pt': 'Ex: Prédio de Esquida',
      'en': 'Example: Corner Building',
      'es': 'Ejemplo: Edificio de esquina',
    },
    '42a3qbzs': {
      'pt': 'Cadastrar-se',
      'en': 'Register',
      'es': 'Registro',
    },
    'yrl42244': {
      'pt': 'Erro',
      'en': 'Error',
      'es': 'Error',
    },
    '5tcd8p4c': {
      'pt': '* Campo é obrigatório.',
      'en': '* This field is required.',
      'es': '* Este campo es obligatorio.',
    },
    '9q46cw4i': {
      'pt': 'Please choose an option from the dropdown',
      'en': 'Please choose an option from the dropdown',
      'es': 'Por favor, elija una opción del menú desplegable.',
    },
    'pu1q07zh': {
      'pt': '* Campo é obrigatório.',
      'en': '* This field is required.',
      'es': '* Este campo es obligatorio.',
    },
    'u1e27ga1': {
      'pt': 'Please choose an option from the dropdown',
      'en': 'Please choose an option from the dropdown',
      'es': 'Por favor, elija una opción del menú desplegable.',
    },
    'bwq005ke': {
      'pt': '* Campo é obrigatório.',
      'en': '* This field is required.',
      'es': '* Este campo es obligatorio.',
    },
    '4eh4qys8': {
      'pt': 'Please choose an option from the dropdown',
      'en': 'Please choose an option from the dropdown',
      'es': 'Por favor, elija una opción del menú desplegable.',
    },
    'zwn5ujtu': {
      'pt': '* Campo é obrigatório.',
      'en': '* This field is required.',
      'es': '* Este campo es obligatorio.',
    },
    '70ca3spf': {
      'pt': 'Please choose an option from the dropdown',
      'en': 'Please choose an option from the dropdown',
      'es': 'Por favor, elija una opción del menú desplegable.',
    },
    '33qjudpl': {
      'pt': '* Campo é obrigatório.',
      'en': '* This field is required.',
      'es': '* Este campo es obligatorio.',
    },
    '1aq44bwk': {
      'pt': 'Digite um email valido.',
      'en': 'Enter a valid email address.',
      'es': 'Introduzca una dirección de correo electrónico válida.',
    },
    'ojl134cn': {
      'pt': 'Please choose an option from the dropdown',
      'en': 'Please choose an option from the dropdown',
      'es': 'Por favor, elija una opción del menú desplegable.',
    },
    'g2ve8357': {
      'pt': '* Campo é obrigatório.',
      'en': '* This field is required.',
      'es': '* Este campo es obligatorio.',
    },
    '9zo479km': {
      'pt': 'Please choose an option from the dropdown',
      'en': 'Please choose an option from the dropdown',
      'es': 'Por favor, elija una opción del menú desplegable.',
    },
    '7ywhs97i': {
      'pt': '* Campo é obrigatório.',
      'en': '* This field is required.',
      'es': '* Este campo es obligatorio.',
    },
    'jwj8odbw': {
      'pt': 'Please choose an option from the dropdown',
      'en': 'Please choose an option from the dropdown',
      'es': 'Por favor, elija una opción del menú desplegable.',
    },
    'yqpkdm0y': {
      'pt': '* Campo é obrigatório.',
      'en': '* This field is required.',
      'es': '* Este campo es obligatorio.',
    },
    'au492wgq': {
      'pt': 'Please choose an option from the dropdown',
      'en': 'Please choose an option from the dropdown',
      'es': 'Por favor, elija una opción del menú desplegable.',
    },
    'bpeccn85': {
      'pt': '* Campo é obrigatório.',
      'en': '* This field is required.',
      'es': '* Este campo es obligatorio.',
    },
    'vt2hnk06': {
      'pt': 'Please choose an option from the dropdown',
      'en': 'Please choose an option from the dropdown',
      'es': 'Por favor, elija una opción del menú desplegable.',
    },
    'zm5ujynw': {
      'pt': '* Campo é obrigatório.',
      'en': '* This field is required.',
      'es': '* Este campo es obligatorio.',
    },
    'wg6bgwcp': {
      'pt': 'Please choose an option from the dropdown',
      'en': 'Please choose an option from the dropdown',
      'es': 'Por favor, elija una opción del menú desplegable.',
    },
    'v4re0ghr': {
      'pt': 'Ex: Predio de Esquida is required',
      'en': 'Ex: Predio de Esquida is required',
      'es': 'Ej: Se requiere Predio de Esquida',
    },
    'l4praqvv': {
      'pt': 'Please choose an option from the dropdown',
      'en': 'Please choose an option from the dropdown',
      'es': 'Por favor, elija una opción del menú desplegable.',
    },
    '6xc9vds5': {
      'pt': 'Home',
      'en': 'Home',
      'es': 'Hogar',
    },
  },
  // BacklogTarefas
  {
    '3lhe86we': {
      'pt': 'Projetos',
      'en': 'Projects',
      'es': 'Proyectos',
    },
    'zjg5fkfx': {
      'pt': 'Projetos Detalhes',
      'en': 'Project Details',
      'es': 'Detalles del proyecto',
    },
    'git0ns5g': {
      'pt': 'Backlog de tarefas',
      'en': 'Task backlog',
      'es': 'Atraso de tareas',
    },
    '8l8qsyda': {
      'pt': 'Backlog de tarefas',
      'en': 'Task backlog',
      'es': 'Atraso de tareas',
    },
    'l1m2o7zq': {
      'pt':
          'Veja todas as tarefas, filtre para aplicar as ações em grupo ou crie novas tarefas',
      'en':
          'View all tasks, filter to apply actions to groups, or create new tasks.',
      'es':
          'Ver todas las tareas, filtrar para aplicar acciones a grupos o crear nuevas tareas.',
    },
    '76uvut5c': {
      'pt': 'Criar tarefas a partir do template',
      'en': 'Create tasks from the template.',
      'es': 'Crear tareas a partir de la plantilla.',
    },
    'rwz126zf': {
      'pt': 'Criar tarefa manualmente',
      'en': 'Create task manually',
      'es': 'Crear tarea manualmente',
    },
    'pzcj0gsp': {
      'pt': 'Importar cronograma de tarefas',
      'en': 'Import task schedule',
      'es': 'Importar programación de tareas',
    },
    'snznv9u2': {
      'pt': 'Sprint em andamento ',
      'en': 'Sprint in progress ',
      'es': 'Sprint en progreso ',
    },
    '01mn2dd4': {
      'pt': '(',
      'en': '(',
      'es': '(',
    },
    'qcvudwjh': {
      'pt': ')',
      'en': ')',
      'es': ')',
    },
    '235mqbfn': {
      'pt': 'Sprint finalizada (100)',
      'en': 'Sprint completed (100)',
      'es': 'Sprint completado (100)',
    },
    '6rsf3u1b': {
      'pt': 'Sprint finalizada ',
      'en': 'Sprint completed ',
      'es': 'Sprint completado ',
    },
    '25lutsb5': {
      'pt': '(',
      'en': '(',
      'es': '(',
    },
    'jkbnvfiq': {
      'pt': ')',
      'en': ')',
      'es': ')',
    },
    'd7lz20fh': {
      'pt': 'Sprint finalizada (100)',
      'en': 'Sprint completed (100)',
      'es': 'Sprint completado (100)',
    },
    'akibl5sg': {
      'pt': 'Procurar por descrição da tarefa',
      'en': 'Search for task description',
      'es': 'Buscar descripción de la tarea',
    },
    'hcx7qu4w': {
      'pt': 'Filtros',
      'en': 'Filters',
      'es': 'Filtros',
    },
    'h89r9vsy': {
      'pt': 'Backlog/Sprint',
      'en': 'Backlog/Sprint',
      'es': 'Backlog/Sprint',
    },
    '8tmz6089': {
      'pt': 'Equipamento',
      'en': 'Equipment',
      'es': 'Equipo',
    },
    'jnz8slz8': {
      'pt': 'Limpar',
      'en': 'To clean',
      'es': 'Para limpiar',
    },
    'vhht2pqx': {
      'pt': 'Selecione um campo',
      'en': 'Select a field',
      'es': 'Seleccione un campo',
    },
    'c18tfw17': {
      'pt': 'Search...',
      'en': 'Search...',
      'es': 'Buscar...',
    },
    'e6d59cxp': {
      'pt': 'Subcampo 01',
      'en': 'Subfield 01',
      'es': 'Subcampo 01',
    },
    '07vn8ck3': {
      'pt': 'Subcampo 02',
      'en': 'Subfield 02',
      'es': 'Subcampo 02',
    },
    '0d1ytzlm': {
      'pt': 'Subcampo 03',
      'en': 'Subfield 03',
      'es': 'Subcampo 03',
    },
    'dz2lz6fc': {
      'pt': 'Selecione uma seção',
      'en': 'Select a section',
      'es': 'Seleccione una sección',
    },
    'cqb8m8re': {
      'pt': 'Search...',
      'en': 'Search...',
      'es': 'Buscar...',
    },
    '5r66a5au': {
      'pt': 'Seção 01',
      'en': 'Section 01',
      'es': 'Sección 01',
    },
    'se5j7xa9': {
      'pt': 'Seção 02',
      'en': 'Section 02',
      'es': 'Sección 02',
    },
    'qgwouxt5': {
      'pt': 'Seção 03',
      'en': 'Section 03',
      'es': 'Sección 03',
    },
    'zkfvxwy5': {
      'pt': 'Selecione uma fileira',
      'en': 'Select a row',
      'es': 'Seleccione una fila',
    },
    'kj4pq556': {
      'pt': 'Search...',
      'en': 'Search...',
      'es': 'Buscar...',
    },
    'v0jqaxjo': {
      'pt': 'Fileira 01',
      'en': 'Row 01',
      'es': 'Fila 01',
    },
    'hrb5ermk': {
      'pt': 'Fileira 02',
      'en': 'Row 02',
      'es': 'Fila 02',
    },
    '7wln5zle': {
      'pt': 'Fileira 03',
      'en': 'Row 03',
      'es': 'Fila 03',
    },
    'ouvhnkib': {
      'pt': 'Posição do tracker',
      'en': 'Tracker position',
      'es': 'Posición del rastreador',
    },
    '3h3al69j': {
      'pt': 'Search...',
      'en': 'Search...',
      'es': 'Buscar...',
    },
    'mbvd8g8f': {
      'pt': 'Tracker 01',
      'en': 'Tracker 01',
      'es': 'Rastreador 01',
    },
    'xvj5u41h': {
      'pt': 'Tracker 02',
      'en': 'Tracker 02',
      'es': 'Rastreador 02',
    },
    'lzhmid4p': {
      'pt': 'Tracker 03',
      'en': 'Tracker 03',
      'es': 'Rastreador 03',
    },
    'qb7vronf': {
      'pt': 'Tarefa',
      'en': 'Task',
      'es': 'Tarea',
    },
    'p52fzhch': {
      'pt': 'Peso',
      'en': 'Weight',
      'es': 'Peso',
    },
    'nrcm88uu': {
      'pt': 'Equipamento',
      'en': 'Equipment',
      'es': 'Equipo',
    },
    'jlf4z2aa': {
      'pt': 'Quantidade',
      'en': 'Amount',
      'es': 'Cantidad',
    },
    'ks76ugh7': {
      'pt': 'Unidade/Medida',
      'en': 'Unit/Measurement',
      'es': 'Unidad/Medida',
    },
    '8gke7ew6': {
      'pt': 'Disciplina',
      'en': 'Discipline',
      'es': 'Disciplina',
    },
    'd5kbjafk': {
      'pt': 'Localização',
      'en': 'Location',
      'es': 'Ubicación',
    },
    'v4svsvsf': {
      'pt': 'Ações',
      'en': 'Actions',
      'es': 'Comportamiento',
    },
    'xo3byysk': {
      'pt': ' ',
      'en': ' ',
      'es': ' ',
    },
    'jiq6t0x8': {
      'pt':
          'Título da Tarefa - Breve descrição em poucas linhas sobre o que é essa tarefa',
      'en':
          'Task Title - Brief description in a few lines of what this task is.',
      'es':
          'Título de la tarea: Breve descripción en pocas líneas de lo que es esta tarea.',
    },
    'ino60sng': {
      'pt': 'Campo ',
      'en': 'Field ',
      'es': 'Campo ',
    },
    'e6b7dp4f': {
      'pt': 'Subcampo 01 - ',
      'en': 'Subfield 01 -',
      'es': 'Subcampo 01 -',
    },
    'gb7r905w': {
      'pt': 'Seção ',
      'en': 'Section ',
      'es': 'Sección ',
    },
    'c8vc825h': {
      'pt': 'Subcampo 01 - ',
      'en': 'Subfield 01 -',
      'es': 'Subcampo 01 -',
    },
    'cq832946': {
      'pt': 'Fileira ',
      'en': 'Row ',
      'es': 'Fila ',
    },
    'ekferwpp': {
      'pt': 'Subcampo 01 - ',
      'en': 'Subfield 01 -',
      'es': 'Subcampo 01 -',
    },
    'bbo4klyn': {
      'pt': 'Tracker ',
      'en': 'Tracker ',
      'es': 'Rastreador ',
    },
    'we3sp6k4': {
      'pt': 'Subcampo 01 - ',
      'en': 'Subfield 01 -',
      'es': 'Subcampo 01 -',
    },
    '2oi9984q': {
      'pt': 'Estaca ',
      'en': 'Stake ',
      'es': 'Apostar ',
    },
    'v0uswf5w': {
      'pt': 'Subcampo 01 - ',
      'en': 'Subfield 01 -',
      'es': 'Subcampo 01 -',
    },
    'vjo23v3d': {
      'pt': ' Qtdd: ',
      'en': 'Qty:',
      'es': 'Cantidad:',
    },
    'kr8boolb': {
      'pt': ' - ',
      'en': '-',
      'es': '-',
    },
    'yeraob7x': {
      'pt':
          'Título da Tarefa - Breve descrição em poucas linhas sobre o que é essa tarefa',
      'en':
          'Task Title - Brief description in a few lines of what this task is.',
      'es':
          'Título de la tarea: Breve descripción en pocas líneas de lo que es esta tarea.',
    },
    'cyzv3gkp': {
      'pt': 'linhas por página:',
      'en': 'lines per page:',
      'es': 'líneas por página:',
    },
    'w9ehe34g': {
      'pt': '10',
      'en': '10',
      'es': '10',
    },
    '18tk3dhw': {
      'pt': '10',
      'en': '10',
      'es': '10',
    },
    '6g5wsh4y': {
      'pt': 'Search...',
      'en': 'Search...',
      'es': 'Buscar...',
    },
    'm91lx1mz': {
      'pt': '5',
      'en': '5',
      'es': '5',
    },
    'epusstu8': {
      'pt': '10',
      'en': '10',
      'es': '10',
    },
    'ttxaixsx': {
      'pt': '15',
      'en': '15',
      'es': '15',
    },
    'wtufuibf': {
      'pt': '20',
      'en': '20',
      'es': '20',
    },
    'a4rik1xj': {
      'pt': '50',
      'en': '50',
      'es': '50',
    },
    '9apgl0r8': {
      'pt': '100',
      'en': '100',
      'es': '100',
    },
    'mwrmwbfv': {
      'pt': 'Home',
      'en': 'Home',
      'es': 'Hogar',
    },
    'kf2qipvw': {
      'pt': 'Erro',
      'en': 'Error',
      'es': 'Error',
    },
  },
  // EsqueciSenha
  {
    'iyzfqpw2': {
      'pt': 'Esqueci senha',
      'en': 'I forgot my password.',
      'es': 'Olvidé mi contraseña.',
    },
    'jxj0tt77': {
      'pt': 'Informe seu email de login.',
      'en': 'Please enter your login email address.',
      'es': 'Ingrese su dirección de correo electrónico de inicio de sesión.',
    },
    'cdjpt7ws': {
      'pt': 'Email',
      'en': 'E-mail',
      'es': 'Correo electrónico',
    },
    'dhikfyd4': {
      'pt': '',
      'en': '',
      'es': '',
    },
    '8lxx1cos': {
      'pt': 'seu@email.com',
      'en': 'your@email.com',
      'es': 'tu@correoelectrónico.com',
    },
    'v4txev93': {
      'pt': 'Você receberá um código via email, informe o código em seguida',
      'en': 'You will receive a code via email; please enter the code below.',
      'es':
          'Recibirás un código por correo electrónico; ingresa el código a continuación.',
    },
    'g7gensmi': {
      'pt': 'Enviar o código',
      'en': 'Send the code',
      'es': 'Envía el código',
    },
    'el2w7sz0': {
      'pt': 'Erro!',
      'en': 'Error!',
      'es': '¡Error!',
    },
    'kkkovoeo': {
      'pt': '*Campo obrigatório',
      'en': '*Required field',
      'es': '*Campo obligatorio',
    },
    'oqdon9un': {
      'pt': 'Please choose an option from the dropdown',
      'en': 'Please choose an option from the dropdown',
      'es': 'Por favor, elija una opción del menú desplegable.',
    },
    '9t16cf23': {
      'pt': 'Esqueci senha',
      'en': 'I forgot my password.',
      'es': 'Olvidé mi contraseña.',
    },
    '4h1roudr': {
      'pt': 'Clique em confirmar código para redefinir sua senha',
      'en': 'Click on confirm code to reset your password.',
      'es':
          'Haga clic en el código de confirmación para restablecer su contraseña.',
    },
    '43711urr': {
      'pt': 'Código',
      'en': 'Code',
      'es': 'Código',
    },
    'k9dha77w': {
      'pt': '',
      'en': '',
      'es': '',
    },
    'lsixyhbp': {
      'pt': 'Ex: 123456',
      'en': '123456',
      'es': '123456',
    },
    'hkxehqh0': {
      'pt': 'Confirmar código',
      'en': 'Confirm code',
      'es': 'Confirmar código',
    },
    'bph7pea6': {
      'pt': 'Erro!',
      'en': 'Error!',
      'es': '¡Error!',
    },
    'qlqlvlvj': {
      'pt': '*Campo obrigatório',
      'en': '*Required field',
      'es': '*Campo obligatorio',
    },
    'rkp1bpah': {
      'pt': 'Please choose an option from the dropdown',
      'en': 'Please choose an option from the dropdown',
      'es': 'Por favor, elija una opción del menú desplegable.',
    },
    'q72n18w2': {
      'pt': 'Redefinir senha',
      'en': 'Reset password',
      'es': 'Restablecer contraseña',
    },
    'edv7t831': {
      'pt': 'Preencha todos os dados a baixo para poder acessar a plataforma',
      'en': 'Please fill in all the information below to access the platform.',
      'es':
          'Por favor, rellene toda la información a continuación para acceder a la plataforma.',
    },
    'ziebmng4': {
      'pt': 'Nova senha',
      'en': 'New Password',
      'es': 'Nueva contraseña',
    },
    'vzgh210c': {
      'pt': '',
      'en': '',
      'es': '',
    },
    '791617jt': {
      'pt': '***************',
      'en': '***************',
      'es': '***************',
    },
    'cdaqouxo': {
      'pt': 'Sua senha está',
      'en': 'Your password is',
      'es': 'Tu contraseña es',
    },
    '9pmj0bjl': {
      'pt': 'fraca',
      'en': 'weak',
      'es': 'débil',
    },
    '52c9rekj': {
      'pt': 'média',
      'en': 'average',
      'es': 'promedio',
    },
    'nbqqszx1': {
      'pt': 'forte',
      'en': 'strong',
      'es': 'fuerte',
    },
    'shevru05': {
      'pt': 'muito forte',
      'en': 'very strong',
      'es': 'acérrimo',
    },
    'dkjj02sr': {
      'pt': 'Confirmar nova senha',
      'en': 'Confirm new password',
      'es': 'Confirmar nueva contraseña',
    },
    '3jc3ve6a': {
      'pt': '',
      'en': '',
      'es': '',
    },
    '12uaikzu': {
      'pt': '***************',
      'en': '***************',
      'es': '***************',
    },
    'uplcrzj2': {
      'pt': 'As senhas não coincidem.',
      'en': 'The passwords don\'t match.',
      'es': 'Las contraseñas no coinciden.',
    },
    'up4eidif': {
      'pt': 'Confirmar senha',
      'en': 'Confirm password',
      'es': 'Confirmar Contraseña',
    },
    'tnqrzbpn': {
      'pt': 'Erro!',
      'en': 'Error!',
      'es': '¡Error!',
    },
    'hotycmmh': {
      'pt': '*Campo obrigatório',
      'en': '*Required field',
      'es': '*Campo obligatorio',
    },
    'k5vvpxtt': {
      'pt': 'Please choose an option from the dropdown',
      'en': 'Please choose an option from the dropdown',
      'es': 'Por favor, elija una opción del menú desplegable.',
    },
    'jz5rzni0': {
      'pt': '*Campo obrigatório',
      'en': '*Required field',
      'es': '*Campo obligatorio',
    },
    'xay4pl65': {
      'pt': 'Please choose an option from the dropdown',
      'en': 'Please choose an option from the dropdown',
      'es': 'Por favor, elija una opción del menú desplegable.',
    },
    'ztvteoi4': {
      'pt': 'Home',
      'en': 'Home',
      'es': 'Hogar',
    },
  },
  // gestaoDeEquipe
  {
    '1iyszvk4': {
      'pt': 'Projetos',
      'en': 'Projects',
      'es': 'Proyectos',
    },
    '43q21uea': {
      'pt': 'Gestão de equipe',
      'en': 'Team management',
      'es': 'Gestión de equipos',
    },
    'ufrjha5y': {
      'pt': 'Gestão de equipe',
      'en': 'Team management',
      'es': 'Gestión de equipos',
    },
    '5639optp': {
      'pt':
          'Adicione funcionários de acordo com a equipe e seus respectivos cargos',
      'en': 'Add employees according to the team and their respective roles.',
      'es': 'Agregue empleados según el equipo y sus respectivos roles.',
    },
    '3wjlquma': {
      'pt': 'Nova equipe',
      'en': 'New team',
      'es': 'Nuevo equipo',
    },
    '6dc3lb5y': {
      'pt': 'Líderes de cada equipe',
      'en': 'Leaders of each team',
      'es': 'Líderes de cada equipo',
    },
    's4wp30fr': {
      'pt': 'Total de lideres',
      'en': 'Total number of leaders',
      'es': 'Número total de líderes',
    },
    'pmskdzvh': {
      'pt': 'Funcionario',
      'en': 'Employee',
      'es': 'Empleado',
    },
    '5zv8vmi5': {
      'pt': 'Equipe',
      'en': 'Team',
      'es': 'Equipo',
    },
    '28bzdf6v': {
      'pt': 'Tipo/Nível de acesso',
      'en': 'Type/Level of access',
      'es': 'Tipo/Nivel de acceso',
    },
    'xqdjxy58': {
      'pt': 'E-mail',
      'en': 'E-mail',
      'es': 'Correo electrónico',
    },
    'stnd5t4y': {
      'pt': 'Whatsapp',
      'en': 'WhatsApp',
      'es': 'WhatsApp',
    },
    'fj1n0hiy': {
      'pt': 'Ações',
      'en': 'Actions',
      'es': 'Comportamiento',
    },
    '1j9i24yu': {
      'pt': 'Cadastrar novo lider',
      'en': 'Register a new leader',
      'es': 'Registrar un nuevo líder',
    },
    'aosrzs21': {
      'pt': 'linhas por página:',
      'en': 'lines per page:',
      'es': 'líneas por página:',
    },
    '7rerd6v5': {
      'pt': '10',
      'en': '10',
      'es': '10',
    },
    'ir66yard': {
      'pt': '10',
      'en': '10',
      'es': '10',
    },
    'vzcvx3io': {
      'pt': 'Search...',
      'en': 'Search...',
      'es': 'Buscar...',
    },
    'pxylr4cw': {
      'pt': '5',
      'en': '5',
      'es': '5',
    },
    '9as4ygam': {
      'pt': '10',
      'en': '10',
      'es': '10',
    },
    'kfue6peo': {
      'pt': '15',
      'en': '15',
      'es': '15',
    },
    'ithjvq0c': {
      'pt': '20',
      'en': '20',
      'es': '20',
    },
    'n5ut7zl3': {
      'pt': '100',
      'en': '100',
      'es': '100',
    },
    'aubtukyq': {
      'pt': 'Total de funcionários',
      'en': 'Total number of employees',
      'es': 'Número total de empleados',
    },
    '37e5cusa': {
      'pt': 'Add funcionário à equipe',
      'en': 'Add employee to team',
      'es': 'Agregar empleado al equipo',
    },
    '7mkfoajl': {
      'pt': 'Filtros',
      'en': 'Filters',
      'es': 'Filtros',
    },
    'ti1fh2ui': {
      'pt': 'Procurar por nome do funcionário',
      'en': 'Search by employee name',
      'es': 'Buscar por nombre de empleado',
    },
    'ztjpwfie': {
      'pt': 'Cargo',
      'en': 'Position',
      'es': 'Posición',
    },
    'gwbdnnop': {
      'pt': 'Limpar',
      'en': 'To clean',
      'es': 'Para limpiar',
    },
    '20oopuvc': {
      'pt': 'Funcionario/cargo',
      'en': 'Employee/Position',
      'es': 'Empleado/Puesto',
    },
    '5v6fqwmn': {
      'pt': 'Equipe',
      'en': 'Team',
      'es': 'Equipo',
    },
    '0mtvd4j5': {
      'pt': 'Tipo/Nível de acesso',
      'en': 'Type/Level of access',
      'es': 'Tipo/Nivel de acceso',
    },
    'pu5pcufi': {
      'pt': 'E-mail',
      'en': 'E-mail',
      'es': 'Correo electrónico',
    },
    'e4ruhgig': {
      'pt': 'Whatsapp',
      'en': 'WhatsApp',
      'es': 'WhatsApp',
    },
    'bwgkg7em': {
      'pt': 'Ações',
      'en': 'Actions',
      'es': 'Comportamiento',
    },
    'h6u9ico6': {
      'pt': 'Cadastrar novo colaborador',
      'en': 'Register a new employee',
      'es': 'Registrar un nuevo empleado',
    },
    '6n7falzt': {
      'pt': 'linhas por página:',
      'en': 'lines per page:',
      'es': 'líneas por página:',
    },
    'hvfurcb9': {
      'pt': '10',
      'en': '10',
      'es': '10',
    },
    '8esi53v1': {
      'pt': '10',
      'en': '10',
      'es': '10',
    },
    's4ayi0qh': {
      'pt': 'Search...',
      'en': 'Search...',
      'es': 'Buscar...',
    },
    'bscjs18z': {
      'pt': '5',
      'en': '5',
      'es': '5',
    },
    'ndufech8': {
      'pt': '10',
      'en': '10',
      'es': '10',
    },
    'uau4voxl': {
      'pt': '15',
      'en': '15',
      'es': '15',
    },
    'tv39yvzh': {
      'pt': '20',
      'en': '20',
      'es': '20',
    },
    '2hkvl4h6': {
      'pt': '100',
      'en': '100',
      'es': '100',
    },
    'uovskxjl': {
      'pt': 'Home',
      'en': 'Home',
      'es': 'Hogar',
    },
  },
  // Projetos
  {
    '9morr8t6': {
      'pt': 'Projetos',
      'en': 'Projects',
      'es': 'Proyectos',
    },
    'dyk17ah2': {
      'pt': 'Aqui você pode acessar todos os parques solares.',
      'en': 'Here you can access all the solar parks.',
      'es': 'Aquí podrás acceder a todos los parques solares.',
    },
    'h824nd7z': {
      'pt': 'Procurar por nome do projeto',
      'en': 'Search by project name',
      'es': 'Buscar por nombre de proyecto',
    },
    'koyns3nk': {
      'pt': 'Limpar',
      'en': 'To clean',
      'es': 'Para limpiar',
    },
    'lno0u4yz': {
      'pt': 'Criar novo projeto',
      'en': 'Create new project',
      'es': 'Crear nuevo proyecto',
    },
    'iag9mf2h': {
      'pt': 'linhas por página:',
      'en': 'lines per page:',
      'es': 'líneas por página:',
    },
    'kbatdmvm': {
      'pt': '10',
      'en': '10',
      'es': '10',
    },
    'xiqtzw1d': {
      'pt': '10',
      'en': '10',
      'es': '10',
    },
    '9ezs1o6n': {
      'pt': 'Search...',
      'en': 'Search...',
      'es': 'Buscar...',
    },
    'lysmo9ph': {
      'pt': '5',
      'en': '5',
      'es': '5',
    },
    'f4zbizkx': {
      'pt': '10',
      'en': '10',
      'es': '10',
    },
    'yinoy6j0': {
      'pt': '15',
      'en': '15',
      'es': '15',
    },
    'h0ew52yg': {
      'pt': '20',
      'en': '20',
      'es': '20',
    },
    '24n5qony': {
      'pt': 'Home',
      'en': 'Home',
      'es': 'Hogar',
    },
  },
  // Sprints
  {
    'nrhzdcwz': {
      'pt': 'Projetos',
      'en': 'Projects',
      'es': 'Proyectos',
    },
    'pruwgbxe': {
      'pt': 'Sprints',
      'en': 'Sprints',
      'es': 'Sprints',
    },
    '8nhmen1y': {
      'pt': 'Sprints',
      'en': 'Sprints',
      'es': 'Sprints',
    },
    's8r1lj0p': {
      'pt':
          'Veja todas as tarefas pendentes, em andamento e concluídas. Aplique filtros se necessário',
      'en':
          'View all pending, ongoing, and completed tasks. Apply filters if needed.',
      'es':
          'Vea todas las tareas pendientes, en curso y completadas. Aplique filtros si es necesario.',
    },
    'c8pw8xbo': {
      'pt': 'Criar nova sprint',
      'en': 'Create a new sprint',
      'es': 'Crear un nuevo sprint',
    },
    'gn40hmr5': {
      'pt': 'SPRINT ATUAL',
      'en': 'CURRENT SPRINT',
      'es': 'SPRINT ACTUAL',
    },
    'uic7rtnb': {
      'pt': 'Sprint',
      'en': 'Sprint',
      'es': 'Sprint',
    },
    'pk48af6h': {
      'pt': 'Objetivo da sprint',
      'en': 'Sprint objective',
      'es': 'Objetivo del sprint',
    },
    '91c044xx': {
      'pt': 'Equipe',
      'en': 'Team',
      'es': 'Equipo',
    },
    'gunf4dqq': {
      'pt': 'Início',
      'en': 'Start',
      'es': 'Comenzar',
    },
    'x4o6i6bb': {
      'pt': 'Fim',
      'en': 'End',
      'es': 'Fin',
    },
    'yywzdjg0': {
      'pt': 'Progresso das tarefas',
      'en': 'Task progress',
      'es': 'Progreso de la tarea',
    },
    '4vcrrnhe': {
      'pt': 'Relatório',
      'en': 'Report',
      'es': 'Informe',
    },
    'bxw1rt50': {
      'pt': 'Ações',
      'en': 'Actions',
      'es': 'Comportamiento',
    },
    'rux2frm8': {
      'pt': ' ',
      'en': ' ',
      'es': ' ',
    },
    'kqi6nnab': {
      'pt': 'ATK-207 ',
      'en': 'ATK-207',
      'es': 'ATK-207',
    },
    'ay2fnrrr': {
      'pt': '{trazer equipe na api}',
      'en': '{bring team into the API}',
      'es': '{Incorporar al equipo a la API}',
    },
    'aeb2ihyq': {
      'pt': 'Ver relatório',
      'en': 'View report',
      'es': 'Ver informe',
    },
    '61900gms': {
      'pt': 'linhas por página:',
      'en': 'lines per page:',
      'es': 'líneas por página:',
    },
    'ja9c9wyn': {
      'pt': '10',
      'en': '10',
      'es': '10',
    },
    'ld66psls': {
      'pt': 'Search...',
      'en': 'Search...',
      'es': 'Buscar...',
    },
    'hhways64': {
      'pt': '5',
      'en': '5',
      'es': '5',
    },
    's47yy0sw': {
      'pt': '10',
      'en': '10',
      'es': '10',
    },
    '9qiwmbrc': {
      'pt': '15',
      'en': '15',
      'es': '15',
    },
    '5wk4m3ui': {
      'pt': '20',
      'en': '20',
      'es': '20',
    },
    's5w84f0u': {
      'pt': 'Procurar por código da sprint',
      'en': 'Search for sprint code',
      'es': 'Buscar código de sprint',
    },
    'w09gupt1': {
      'pt': 'SPRINTS FUTURAS',
      'en': 'FUTURE SPRINTS',
      'es': 'FUTUROS SPRINTS',
    },
    'mfkgxpu6': {
      'pt': 'SPRINTS FINALIZADAS',
      'en': 'SPRINTS COMPLETED',
      'es': 'SPRINTS COMPLETADOS',
    },
    'gnbioe0q': {
      'pt': 'Código da sprint',
      'en': 'Sprint code',
      'es': 'Código de sprint',
    },
    'yabmpiug': {
      'pt': 'Objetivo da sprint',
      'en': 'Sprint objective',
      'es': 'Objetivo del sprint',
    },
    'wd9kdmxm': {
      'pt': 'Início',
      'en': 'Start',
      'es': 'Comenzar',
    },
    '6chz2fyc': {
      'pt': 'Fim',
      'en': 'End',
      'es': 'Fin',
    },
    '1o3s26bp': {
      'pt': 'Progresso final das tarefas',
      'en': 'Final progress of tasks',
      'es': 'Progreso final de las tareas',
    },
    'asywvisq': {
      'pt': 'Relatório',
      'en': 'Report',
      'es': 'Informe',
    },
    'qbl2vdgd': {
      'pt': 'Ações',
      'en': 'Actions',
      'es': 'Comportamiento',
    },
    'uxefpsh1': {
      'pt': ' ',
      'en': ' ',
      'es': ' ',
    },
    'vh2hmnpa': {
      'pt': 'ATK-207 ',
      'en': 'ATK-207',
      'es': 'ATK-207',
    },
    '61ygzodt': {
      'pt': 'Ver relatório',
      'en': 'View report',
      'es': 'Ver informe',
    },
    'u66yn7qt': {
      'pt': 'linhas por página:',
      'en': 'lines per page:',
      'es': 'líneas por página:',
    },
    'izviyfmd': {
      'pt': '10',
      'en': '10',
      'es': '10',
    },
    '9sykmq9s': {
      'pt': 'Search...',
      'en': 'Search...',
      'es': 'Buscar...',
    },
    'kyuvxvk0': {
      'pt': '5',
      'en': '5',
      'es': '5',
    },
    '9xy1hs4p': {
      'pt': '10',
      'en': '10',
      'es': '10',
    },
    'gdx3oj79': {
      'pt': '15',
      'en': '15',
      'es': '15',
    },
    'gd13ylst': {
      'pt': '20',
      'en': '20',
      'es': '20',
    },
    'juk3rigc': {
      'pt': ' ',
      'en': ' ',
      'es': ' ',
    },
    'u2hs1vgl': {
      'pt': 'ATK-207 ',
      'en': 'ATK-207',
      'es': 'ATK-207',
    },
    '5hx2afwr': {
      'pt': 'Ver relatório',
      'en': 'View report',
      'es': 'Ver informe',
    },
    'sl337bb8': {
      'pt': 'linhas por página:',
      'en': 'lines per page:',
      'es': 'líneas por página:',
    },
    '3f1tfs61': {
      'pt': '10',
      'en': '10',
      'es': '10',
    },
    'op4ucmwy': {
      'pt': 'Search...',
      'en': 'Search...',
      'es': 'Buscar...',
    },
    'ofo9oyb2': {
      'pt': '5',
      'en': '5',
      'es': '5',
    },
    '1gehvtj7': {
      'pt': '10',
      'en': '10',
      'es': '10',
    },
    'rq6hi7e7': {
      'pt': '15',
      'en': '15',
      'es': '15',
    },
    'yuctqz2h': {
      'pt': '20',
      'en': '20',
      'es': '20',
    },
    's06h3ocj': {
      'pt': 'Home',
      'en': 'Home',
      'es': 'Hogar',
    },
  },
  // RelatorioRDO
  {
    'vmx2hc8r': {
      'pt': 'Projetos',
      'en': 'Projects',
      'es': 'Proyectos',
    },
    '6x9j6kzf': {
      'pt': 'Relatórios',
      'en': 'Reports',
      'es': 'Informes',
    },
    '67dt74fi': {
      'pt': 'Detalhes do RDO',
      'en': 'RDO Details',
      'es': 'Detalles de RDO',
    },
    'mqfs4t96': {
      'pt': 'Filtros',
      'en': 'Filters',
      'es': 'Filtros',
    },
    '19ob99r9': {
      'pt': 'Procurar por nome do líder ou pela equipe',
      'en': 'Search by leader\'s name or by team.',
      'es': 'Buscar por nombre del líder o por equipo.',
    },
    'opge789b': {
      'pt': 'Limpar',
      'en': 'To clean',
      'es': 'Para limpiar',
    },
    'ietjm34s': {
      'pt': 'Baixar PDF',
      'en': 'Download PDF',
      'es': 'Descargar PDF',
    },
    'z5mcswcc': {
      'pt': 'Lider(es)/Cargo',
      'en': 'Leader(s)/Position',
      'es': 'Líder(es)/Posición',
    },
    '4mtscobw': {
      'pt': 'Equipe',
      'en': 'Team',
      'es': 'Equipo',
    },
    'u0fxmghg': {
      'pt': 'Conclusão das tarefas',
      'en': 'Completion of tasks',
      'es': 'Finalización de tareas',
    },
    'usn7vz54': {
      'pt': 'Home',
      'en': 'Home',
      'es': 'Hogar',
    },
  },
  // Funcionario
  {
    '3zvh86ef': {
      'pt': 'Funcionários',
      'en': 'Employees',
      'es': 'Empleados',
    },
    '17jitzg8': {
      'pt':
          'Aqui você pode ver todos os funcionários, filtrar por cargo ou equipe, pesquisar por colaborador ou projeto e criar um novo usuário',
      'en':
          'Here you can view all employees, filter by job title or team, search by employee or project, and create a new user.',
      'es':
          'Aquí puede ver todos los empleados, filtrar por puesto de trabajo o equipo, buscar por empleado o proyecto y crear un nuevo usuario.',
    },
    'p5wmihtc': {
      'pt': 'Filtros',
      'en': 'Filters',
      'es': 'Filtros',
    },
    'wfr76yyp': {
      'pt': 'Cargo',
      'en': 'Position',
      'es': 'Posición',
    },
    '43cs8y2a': {
      'pt': 'Limpar',
      'en': 'To clean',
      'es': 'Para limpiar',
    },
    'os66sj4h': {
      'pt': 'Procurar por nome do funcionário',
      'en': 'Search by employee name',
      'es': 'Buscar por nombre de empleado',
    },
    'wyqkwufb': {
      'pt': 'Exportar Dados dos Colaboradores',
      'en': 'Export Employee Data',
      'es': 'Exportar datos de empleados',
    },
    'k4brq2v0': {
      'pt':
          'Gere um arquivo com todas as informações das pessoas colaboradoras da sua empresa, como dados pessoais, de contato e detalhes do contrato.',
      'en':
          'Generate a file containing all the information about your company\'s employees, such as personal data, contact information, and contract details.',
      'es':
          'Genere un archivo que contenga toda la información sobre los empleados de su empresa, como datos personales, información de contacto y detalles del contrato.',
    },
    'jcuabe4r': {
      'pt': 'Criar usuário para um funcionários',
      'en': 'Create a user for an employee.',
      'es': 'Crear un usuario para un empleado.',
    },
    'mm5qf7jt': {
      'pt': 'Projeto',
      'en': 'Project',
      'es': 'Proyecto',
    },
    '41wxds7w': {
      'pt': 'Funcionário/Cargo',
      'en': 'Employee/Position',
      'es': 'Empleado/Puesto',
    },
    'lpb5whg3': {
      'pt': 'Email',
      'en': 'E-mail',
      'es': 'Correo electrónico',
    },
    'hqo5245d': {
      'pt': 'Whatsapp',
      'en': 'WhatsApp',
      'es': 'WhatsApp',
    },
    'k3e25735': {
      'pt': 'Tipo/Nível de acesso',
      'en': 'Type/Level of access',
      'es': 'Tipo/Nivel de acceso',
    },
    'vudf0258': {
      'pt': 'Ações',
      'en': 'Actions',
      'es': 'Comportamiento',
    },
    '9w6r2za1': {
      'pt': 'linhas por página:',
      'en': 'lines per page:',
      'es': 'líneas por página:',
    },
    'bu2k47p1': {
      'pt': '10',
      'en': '10',
      'es': '10',
    },
    'tyohw5k8': {
      'pt': 'Search...',
      'en': 'Search...',
      'es': 'Buscar...',
    },
    '5qcnx261': {
      'pt': '5',
      'en': '5',
      'es': '5',
    },
    'uutw9lvk': {
      'pt': '10',
      'en': '10',
      'es': '10',
    },
    't8x8a2gk': {
      'pt': '15',
      'en': '15',
      'es': '15',
    },
    'mwsvvajs': {
      'pt': '20',
      'en': '20',
      'es': '20',
    },
    'p6a0kwmt': {
      'pt': '100',
      'en': '100',
      'es': '100',
    },
    '0vy25bgi': {
      'pt': 'Home',
      'en': 'Home',
      'es': 'Hogar',
    },
  },
  // ModulosTrackersMap
  {
    'uhih157x': {
      'pt': 'Projetos',
      'en': 'Projects',
      'es': 'Proyectos',
    },
    '4omaxtoy': {
      'pt': 'Mapa de trackers',
      'en': 'Tracker map',
      'es': 'Mapa de seguimiento',
    },
    'ticcmkyb': {
      'pt': 'Mapa de trackers',
      'en': 'Tracker map',
      'es': 'Mapa de seguimiento',
    },
    '0grh56pf': {
      'pt':
          'Crie e administre os lotes que fazem parte do seu projeto. Cada lote abarca trackers e módulos.',
      'en':
          'Create and manage the lots that are part of your project. Each lot includes trackers and modules.',
      'es':
          'Crea y gestiona los lotes de tu proyecto. Cada lote incluye rastreadores y módulos.',
    },
    '73b2rvhg': {
      'pt': 'Estágio do projeto',
      'en': 'Project stage',
      'es': 'Etapa del proyecto',
    },
    '5u3ix5yq': {
      'pt': 'Campo 01',
      'en': 'Field 01',
      'es': 'Campo 01',
    },
    'b3ju6sta': {
      'pt': 'Selecione um campo',
      'en': 'Select a field',
      'es': 'Seleccione un campo',
    },
    'lnn6iq6u': {
      'pt': 'Search...',
      'en': 'Search...',
      'es': 'Buscar...',
    },
    'gn50ack8': {
      'pt': 'Campo 01',
      'en': 'Field 01',
      'es': 'Campo 01',
    },
    'qsm986ef': {
      'pt': 'Campo 02',
      'en': 'Field 02',
      'es': 'Campo 02',
    },
    'ngbhckze': {
      'pt': 'Campo 03',
      'en': 'Field 03',
      'es': 'Campo 03',
    },
    'b78se9b5': {
      'pt': 'Editar campo selecionado',
      'en': 'Edit selected field',
      'es': 'Editar campo seleccionado',
    },
    'ebrtl9sd': {
      'pt': 'Criar novo campo',
      'en': 'Create new field',
      'es': 'Crear nuevo campo',
    },
    'owucvzy1': {
      'pt': 'Filtros',
      'en': 'Filters',
      'es': 'Filtros',
    },
    'fgae0o2g': {
      'pt': 'Status estacas',
      'en': 'Status stakes',
      'es': 'Lo que está en juego en cuanto a estatus',
    },
    'vq0s3krz': {
      'pt': 'Status tracker',
      'en': 'Status tracker',
      'es': 'Rastreador de estado',
    },
    '603gso23': {
      'pt': 'Tipo de tracker',
      'en': 'Tracker type',
      'es': 'Tipo de rastreador',
    },
    'jgh9k659': {
      'pt': 'Limpar',
      'en': 'To clean',
      'es': 'Para limpiar',
    },
    'ya2jpgal': {
      'pt': 'Nova seção',
      'en': 'New section',
      'es': 'Nueva sección',
    },
    'hdb45xjx': {
      'pt': 'Fileira',
      'en': 'Row',
      'es': 'Fila',
    },
    'ks6gd3z7': {
      'pt': 'Trackers',
      'en': 'Trackers',
      'es': 'Rastreadores',
    },
    'mogrb6bx': {
      'pt':
          'Atenção: os números em ordem indicam a posição de cada estaca dentro da fileira.',
      'en':
          'Note: the numbers in order indicate the position of each stake within the row.',
      'es':
          'Nota: los números en orden indican la posición de cada estaca dentro de la fila.',
    },
    'n9ck3all': {
      'pt': 'Fileiras selecionadas',
      'en': 'Selected rows',
      'es': 'Filas seleccionadas',
    },
    'rc6qacnq': {
      'pt': 'Adicionar fileira(s)',
      'en': 'Add row(s)',
      'es': 'Agregar fila(s)',
    },
    'li4qroax': {
      'pt': 'Exportar PDF do mapa de tracker',
      'en': 'Export PDF of tracker map',
      'es': 'Exportar PDF del mapa de seguimiento',
    },
    'wvvy4x2r': {
      'pt': 'Clique na fileira para configurar os trackers',
      'en': 'Click on the row to configure the trackers.',
      'es': 'Haga clic en la fila para configurar los rastreadores.',
    },
    'a29j0viv': {
      'pt': 'Nenhum dado foi encontrado.',
      'en': 'No data was found.',
      'es': 'No se encontraron datos',
    },
    'b7dicpck': {
      'pt': '|',
      'en': '|',
      'es': '|',
    },
    'dr227nci': {
      'pt': '|',
      'en': '|',
      'es': '|',
    },
    '8xczedn2': {
      'pt': 'Aguardando estacas',
      'en': 'Awaiting stakes',
      'es': 'A la espera de las apuestas',
    },
    '4mfr23m0': {
      'pt': 'Problema, mas liberado para montagem',
      'en': 'Problem, but cleared for assembly.',
      'es': 'Problema, pero listo para montar.',
    },
    'yr95zncq': {
      'pt': 'Liberado para montagem',
      'en': 'Released for assembly',
      'es': 'Liberado para ensamblaje',
    },
    '509lqh74': {
      'pt': 'Tracker e módulos instalados',
      'en': 'Tracker and installed modules',
      'es': 'Rastreador y módulos instalados',
    },
    'em1j2pe4': {
      'pt': 'Impedido para montagem',
      'en': 'Prevented from assembly',
      'es': 'Impedido de montaje',
    },
    '6laxoddg': {
      'pt': '02',
      'en': '02',
      'es': '02',
    },
    'p20260oz': {
      'pt': '03',
      'en': '03',
      'es': '03',
    },
    'a52bxzlk': {
      'pt': '04',
      'en': '04',
      'es': '04',
    },
    '2q2h1fy2': {
      'pt': '05',
      'en': '05',
      'es': '05',
    },
    '1k8brbm0': {
      'pt': '06',
      'en': '06',
      'es': '06',
    },
    '8o0ljq6k': {
      'pt': '08',
      'en': '08',
      'es': '08',
    },
    'ztst0lrp': {
      'pt': '09',
      'en': '09',
      'es': '09',
    },
    '8rp5gksb': {
      'pt': '10',
      'en': '10',
      'es': '10',
    },
    'bbm4ilf7': {
      'pt': '11',
      'en': '11',
      'es': '11',
    },
    'wp587u8e': {
      'pt': 'K',
      'en': 'K',
      'es': 'K',
    },
    '6icf9k4w': {
      'pt': 'L',
      'en': 'L',
      'es': 'L',
    },
    's140udvr': {
      'pt': 'M',
      'en': 'M',
      'es': 'METRO',
    },
    'j28gtj45': {
      'pt': 'N',
      'en': 'N',
      'es': 'norte',
    },
    'adoyxnpj': {
      'pt': 'O',
      'en': 'THE',
      'es': 'EL',
    },
    'ohvxs5qr': {
      'pt': 'P',
      'en': 'P',
      'es': 'PAG',
    },
    'v5q20m1j': {
      'pt': 'Q',
      'en': 'Q',
      'es': 'Q',
    },
    'ot6vpfpi': {
      'pt': 'Nenhum dado foi encontrado.',
      'en': 'No data was found.',
      'es': 'No se encontraron datos',
    },
    '9ku5p1hu': {
      'pt': '01',
      'en': '01',
      'es': '01',
    },
    '79m1woat': {
      'pt': '{{Tipo do Tracker}}',
      'en': '{{Tracker Type}}',
      'es': '{{Tipo de rastreador}}',
    },
    '5vbxcmia': {
      'pt': '|',
      'en': '|',
      'es': '|',
    },
    'unpqyzoz': {
      'pt': '{{Fabricante do Tracker}}',
      'en': '{{Tracker Manufacturer}}',
      'es': '{{Fabricante del rastreador}}',
    },
    'thgr8vrg': {
      'pt': '|',
      'en': '|',
      'es': '|',
    },
    '8xnzjr8p': {
      'pt': 'Aguardando estacas',
      'en': 'Awaiting stakes',
      'es': 'A la espera de las apuestas',
    },
    'ewm7ctm2': {
      'pt': 'A',
      'en': 'THE',
      'es': 'EL',
    },
    'ervkvxqq': {
      'pt': 'B',
      'en': 'B',
      'es': 'B',
    },
    'd3se9gfb': {
      'pt': 'C',
      'en': 'W',
      'es': 'O',
    },
    'ai7gyr65': {
      'pt': 'D',
      'en': 'D',
      'es': 'D',
    },
    'l1my9z2y': {
      'pt': 'E',
      'en': 'AND',
      'es': 'Y',
    },
    'lwuqd7he': {
      'pt': 'F',
      'en': 'F',
      'es': 'F',
    },
    'a2urxgkv': {
      'pt': 'G',
      'en': 'G',
      'es': 'GRAMO',
    },
    'qylbph5k': {
      'pt': 'H',
      'en': 'H',
      'es': 'H',
    },
    '2ljenidm': {
      'pt': 'I',
      'en': 'I',
      'es': 'I',
    },
    '0d50jet7': {
      'pt': 'J',
      'en': 'J',
      'es': 'J',
    },
    'wxbjhf78': {
      'pt': 'K',
      'en': 'K',
      'es': 'K',
    },
    'w8ff3lv4': {
      'pt': 'L',
      'en': 'L',
      'es': 'L',
    },
    'f8zm0pk8': {
      'pt': 'M',
      'en': 'M',
      'es': 'METRO',
    },
    'jncz7vqc': {
      'pt': 'N',
      'en': 'N',
      'es': 'norte',
    },
    '3zggcrgm': {
      'pt': 'O',
      'en': 'THE',
      'es': 'EL',
    },
    'bo10jyml': {
      'pt': 'P',
      'en': 'P',
      'es': 'PAG',
    },
    'qzuzger3': {
      'pt': 'Q',
      'en': 'Q',
      'es': 'Q',
    },
    'lp7dabgr': {
      'pt': 'Home',
      'en': 'Home',
      'es': 'Hogar',
    },
  },
  // Sprint-Atual
  {
    'xytzcyfx': {
      'pt': 'Projetos',
      'en': 'Projects',
      'es': 'Proyectos',
    },
    'z1giudxb': {
      'pt': 'Sprints',
      'en': 'Sprints',
      'es': 'Sprints',
    },
    's4omgz1o': {
      'pt': 'Sprints Detalhes',
      'en': 'Sprints Details',
      'es': 'Detalles de los sprints',
    },
    'uf70ssw3': {
      'pt':
          'Veja todas as tarefas pendentes, em andamento e concluídas. Aplique filtros se necessário',
      'en':
          'View all pending, ongoing, and completed tasks. Apply filters if needed.',
      'es':
          'Vea todas las tareas pendientes, en curso y completadas. Aplique filtros si es necesario.',
    },
    '3kpr42jq': {
      'pt': 'Kanban',
      'en': 'Kanban',
      'es': 'Kanban',
    },
    'xis7l4bd': {
      'pt': 'Lista',
      'en': 'List',
      'es': 'Lista',
    },
    'j0nuyh3f': {
      'pt': 'Procurar por código',
      'en': 'Search by code',
      'es': 'Buscar por código',
    },
    '82fm6ryl': {
      'pt': 'Adicionar tarefas à sprint',
      'en': 'Add tasks to the sprint.',
      'es': 'Añadir tareas al sprint.',
    },
    '0u7guajq': {
      'pt': 'Você precisa criar uma equipe',
      'en': 'You need to create a team.',
      'es': 'Necesitas crear un equipo.',
    },
    'a34tdy7c': {
      'pt':
          'Para adicionar uma tarefa à sprint, você deve ter pelo menos uma equipe criada.',
      'en':
          'To add a task to the sprint, you must have at least one team created.',
      'es':
          'Para agregar una tarea al sprint, es necesario tener al menos un equipo creado.',
    },
    'saj7w11u': {
      'pt': 'Filtros',
      'en': 'Filters',
      'es': 'Filtros',
    },
    'ibb6ws3y': {
      'pt': 'Equipamento',
      'en': 'Equipment',
      'es': 'Equipo',
    },
    '99t8x914': {
      'pt': 'Equipe',
      'en': 'Team',
      'es': 'Equipo',
    },
    'culntr4b': {
      'pt': 'Selecione um campo',
      'en': 'Select a field',
      'es': 'Seleccione un campo',
    },
    'mc4fyiaf': {
      'pt': 'Search...',
      'en': 'Search...',
      'es': 'Buscar...',
    },
    'j9ol6vb2': {
      'pt': 'Subcampo 01',
      'en': 'Subfield 01',
      'es': 'Subcampo 01',
    },
    'sbg0dzn4': {
      'pt': 'Subcampo 02',
      'en': 'Subfield 02',
      'es': 'Subcampo 02',
    },
    'cas61r4w': {
      'pt': 'Subcampo 03',
      'en': 'Subfield 03',
      'es': 'Subcampo 03',
    },
    'umgc7r43': {
      'pt': 'Selecione uma seção',
      'en': 'Select a section',
      'es': 'Seleccione una sección',
    },
    'bt2nsqq6': {
      'pt': 'Search...',
      'en': 'Search...',
      'es': 'Buscar...',
    },
    'ig30r5uy': {
      'pt': 'Subcampo 01',
      'en': 'Subfield 01',
      'es': 'Subcampo 01',
    },
    'k2lj1wdn': {
      'pt': 'Subcampo 02',
      'en': 'Subfield 02',
      'es': 'Subcampo 02',
    },
    'wntwa4ak': {
      'pt': 'Subcampo 03',
      'en': 'Subfield 03',
      'es': 'Subcampo 03',
    },
    'hwhggqxj': {
      'pt': 'Selecione uma fileira',
      'en': 'Select a row',
      'es': 'Seleccione una fila',
    },
    'bsd3wz2e': {
      'pt': 'Search...',
      'en': 'Search...',
      'es': 'Buscar...',
    },
    'pl0rookg': {
      'pt': 'Subcampo 01',
      'en': 'Subfield 01',
      'es': 'Subcampo 01',
    },
    'jf8decjv': {
      'pt': 'Subcampo 02',
      'en': 'Subfield 02',
      'es': 'Subcampo 02',
    },
    'vnqamh52': {
      'pt': 'Subcampo 03',
      'en': 'Subfield 03',
      'es': 'Subcampo 03',
    },
    'oxd9p6gp': {
      'pt': 'Limpar',
      'en': 'To clean',
      'es': 'Para limpiar',
    },
    '9yp6f56z': {
      'pt': 'Atenção: as tarefas só podem ser concluídas no aplicativo',
      'en': 'Please note: tasks can only be completed in the app.',
      'es':
          'Tenga en cuenta: las tareas solo se pueden completar en la aplicación.',
    },
    '8zdiezsc': {
      'pt': 'Data filtrada:',
      'en': 'Filtered data:',
      'es': 'Datos filtrados:',
    },
    'uq6xtrmr': {
      'pt': 'Mover para andamento',
      'en': 'Move to progress',
      'es': 'Moverse hacia el progreso',
    },
    'chr9trqw': {
      'pt': 'Pendentes',
      'en': 'Pending',
      'es': 'Pendiente',
    },
    'rjqcx72s': {
      'pt': 'Discipline: ',
      'en': 'Discipline: ',
      'es': 'Disciplina: ',
    },
    'e24knlys': {
      'pt': 'Quantidade da tarefa',
      'en': 'Task quantity',
      'es': 'Cantidad de tareas',
    },
    '78937bxu': {
      'pt': 'Qtd da tarefa: ',
      'en': 'Task quantity: ',
      'es': 'Cantidad de tareas: ',
    },
    'dbinjytn': {
      'pt': ' ',
      'en': '',
      'es': '',
    },
    '54o5465m': {
      'pt': 'Quantidade da tarefa',
      'en': 'Task quantity',
      'es': 'Cantidad de tareas',
    },
    'ucca1obl': {
      'pt': 'Qtd executada: ',
      'en': 'Quantity executed: ',
      'es': 'Cantidad ejecutada: ',
    },
    '5fmmmo45': {
      'pt': ' ',
      'en': '',
      'es': '',
    },
    'mu7s0cam': {
      'pt': 'Quantidade da tarefa',
      'en': 'Task quantity',
      'es': 'Cantidad de tareas',
    },
    '7u80t50z': {
      'pt': ' - ',
      'en': ' - ',
      'es': ' - ',
    },
    'yrtaerdh': {
      'pt': ' funcionários',
      'en': ' employees',
      'es': ' empleados',
    },
    'a3t3q5a2': {
      'pt': 'Campo ',
      'en': 'Field ',
      'es': 'Campo ',
    },
    '39ptrblh': {
      'pt': 'Seção ',
      'en': 'Section ',
      'es': 'Sección ',
    },
    'een7jzs7': {
      'pt': 'Fileira ',
      'en': 'Row ',
      'es': 'Fila ',
    },
    '3gw92iqw': {
      'pt': 'Tracker ',
      'en': 'Tracker ',
      'es': 'Rastreador ',
    },
    'p76iiqpp': {
      'pt': 'Estaca ',
      'en': 'Stake ',
      'es': 'Apostar ',
    },
    'e4jff9cg': {
      'pt': 'Detalhe da tarefa',
      'en': 'Task details',
      'es': 'Detalles de la tarea',
    },
    'u7zwbbzv': {
      'pt': 'Ver mais',
      'en': 'See more',
      'es': 'Ver más',
    },
    'z4kwqs2h': {
      'pt': 'Em andamento',
      'en': 'In progress',
      'es': 'En curso',
    },
    'mtken0fx': {
      'pt': 'Discipline: ',
      'en': 'Discipline: ',
      'es': 'Disciplina: ',
    },
    'mvk989s9': {
      'pt': 'Quantidade da tarefa',
      'en': 'Task quantity',
      'es': 'Cantidad de tareas',
    },
    'dvokkwlx': {
      'pt': 'Qtd da tarefa: ',
      'en': 'Task quantity: ',
      'es': 'Cantidad de tareas: ',
    },
    't47ndq1d': {
      'pt': ' ',
      'en': '',
      'es': '',
    },
    'yx8hrqta': {
      'pt': 'Quantidade da tarefa',
      'en': 'Task quantity',
      'es': 'Cantidad de tareas',
    },
    '7heioa9a': {
      'pt': 'Qtd executada: ',
      'en': 'Quantity executed: ',
      'es': 'Cantidad ejecutada: ',
    },
    'na612wno': {
      'pt': ' ',
      'en': '',
      'es': '',
    },
    'gaxyczg4': {
      'pt': 'Quantidade da tarefa',
      'en': 'Task quantity',
      'es': 'Cantidad de tareas',
    },
    '6ig0mufz': {
      'pt': ' - ',
      'en': ' - ',
      'es': ' - ',
    },
    '1lipuinl': {
      'pt': ' funcionários',
      'en': ' employees',
      'es': ' empleados',
    },
    'egld9yu0': {
      'pt': 'Campo ',
      'en': 'Field ',
      'es': 'Campo ',
    },
    'muhv681r': {
      'pt': 'Seção ',
      'en': 'Section ',
      'es': 'Sección ',
    },
    'h3rb5xps': {
      'pt': 'Fileira ',
      'en': 'Row ',
      'es': 'Fila ',
    },
    'y7q0eoab': {
      'pt': 'Tracker ',
      'en': 'Tracker ',
      'es': 'Rastreador ',
    },
    'h8nuanas': {
      'pt': 'Estaca ',
      'en': 'Stake ',
      'es': 'Apostar ',
    },
    '5rhgix4h': {
      'pt': 'Detalhe da tarefa',
      'en': 'Task details',
      'es': 'Detalles de la tarea',
    },
    'l75bawkn': {
      'pt': 'Ver mais',
      'en': 'See more',
      'es': 'Ver más',
    },
    'mf9mamjz': {
      'pt': 'Atenção',
      'en': 'Attention',
      'es': 'Atención',
    },
    '0ijxri73': {
      'pt':
          'Para mover esta tarefa, todas as estacas devem estar cravadas com sucesso',
      'en':
          'To move this task forward, all stakes must be successfully driven into the ground.',
      'es':
          'Para llevar adelante esta tarea es necesario clavar con éxito todas las estacas en el suelo.',
    },
    '1i4zuivs': {
      'pt': 'Aguardando Inspeção',
      'en': 'Awaiting Inspection',
      'es': 'En espera de inspección',
    },
    '6a6h3oow': {
      'pt': 'Discipline: ',
      'en': 'Discipline: ',
      'es': 'Disciplina: ',
    },
    '4mzrixtm': {
      'pt': 'Quantidade da tarefa',
      'en': 'Task quantity',
      'es': 'Cantidad de tareas',
    },
    '322ye9wj': {
      'pt': 'Qtd da tarefa: ',
      'en': 'Task quantity: ',
      'es': 'Cantidad de tareas: ',
    },
    'l9nje6wq': {
      'pt': ' ',
      'en': '',
      'es': '',
    },
    'vlj9ws3k': {
      'pt': 'Quantidade da tarefa',
      'en': 'Task quantity',
      'es': 'Cantidad de tareas',
    },
    'wd4ey7b9': {
      'pt': 'Qtd executada: ',
      'en': 'Quantity executed: ',
      'es': 'Cantidad ejecutada: ',
    },
    'bkgsmatv': {
      'pt': ' ',
      'en': '',
      'es': '',
    },
    'znbewcoc': {
      'pt': 'Quantidade da tarefa',
      'en': 'Task quantity',
      'es': 'Cantidad de tareas',
    },
    'znbdcoyv': {
      'pt': ' - ',
      'en': ' - ',
      'es': ' - ',
    },
    '5jzbp9te': {
      'pt': ' funcionários',
      'en': ' employees',
      'es': ' empleados',
    },
    '6e2f7e7d': {
      'pt': 'Campo ',
      'en': 'Field ',
      'es': 'Campo ',
    },
    'gvee5r33': {
      'pt': 'Seção ',
      'en': 'Section ',
      'es': 'Sección ',
    },
    '4ca4cqlo': {
      'pt': 'Fileira ',
      'en': 'Row ',
      'es': 'Fila ',
    },
    'ogsq3vcd': {
      'pt': 'Tracker ',
      'en': 'Tracker ',
      'es': 'Rastreador ',
    },
    'r7a610bv': {
      'pt': 'Estaca ',
      'en': 'Stake ',
      'es': 'Apostar ',
    },
    '9sr9pva0': {
      'pt': 'Detalhe da tarefa',
      'en': 'Task details',
      'es': 'Detalles de la tarea',
    },
    '47cwzfm6': {
      'pt': 'Ver mais',
      'en': 'See more',
      'es': 'Ver más',
    },
    'oha62gf2': {
      'pt': 'Sem Sucesso',
      'en': 'Unsuccessful',
      'es': 'Fracasado',
    },
    'w5fbrs3x': {
      'pt': 'Discipline: ',
      'en': 'Discipline: ',
      'es': 'Disciplina: ',
    },
    '9my33g9g': {
      'pt': 'Quantidade da tarefa',
      'en': 'Task quantity',
      'es': 'Cantidad de tareas',
    },
    'tkbx13jm': {
      'pt': 'Qtd da tarefa: ',
      'en': 'Task quantity: ',
      'es': 'Cantidad de tareas: ',
    },
    '5cm5i4z5': {
      'pt': ' ',
      'en': '',
      'es': '',
    },
    'rk1tbqv1': {
      'pt': 'Quantidade da tarefa',
      'en': 'Task quantity',
      'es': 'Cantidad de tareas',
    },
    'kx18pzry': {
      'pt': 'Qtd executada: ',
      'en': 'Quantity executed: ',
      'es': 'Cantidad ejecutada: ',
    },
    'mnhy1ha5': {
      'pt': ' ',
      'en': '',
      'es': '',
    },
    'y3q6x0db': {
      'pt': 'Quantidade da tarefa',
      'en': 'Task quantity',
      'es': 'Cantidad de tareas',
    },
    'y7yjbq6b': {
      'pt': ' - ',
      'en': ' - ',
      'es': ' - ',
    },
    'apmfahdp': {
      'pt': ' funcionários',
      'en': ' employees',
      'es': ' empleados',
    },
    'u6kss0z2': {
      'pt': 'Campo ',
      'en': 'Field ',
      'es': 'Campo ',
    },
    'h92qiz5u': {
      'pt': 'Seção ',
      'en': 'Section ',
      'es': 'Sección ',
    },
    '7a50r7ds': {
      'pt': 'Fileira ',
      'en': 'Row ',
      'es': 'Fila ',
    },
    'mmb13k1e': {
      'pt': 'Tracker ',
      'en': 'Tracker ',
      'es': 'Rastreador ',
    },
    'z0gg1mwx': {
      'pt': 'Estaca ',
      'en': 'Stake ',
      'es': 'Apostar ',
    },
    'zjt000ci': {
      'pt': 'Detalhe da tarefa',
      'en': 'Task details',
      'es': 'Detalles de la tarea',
    },
    '87xp6l97': {
      'pt': 'Ver mais',
      'en': 'See more',
      'es': 'Ver más',
    },
    'npee0e73': {
      'pt': 'Concluídas',
      'en': 'Completed',
      'es': 'Terminado',
    },
    'k60su7t5': {
      'pt': 'Discipline: ',
      'en': 'Discipline: ',
      'es': 'Disciplina: ',
    },
    'b7yaieel': {
      'pt': 'Quantidade da tarefa',
      'en': 'Task quantity',
      'es': 'Cantidad de tareas',
    },
    '9h4bgrrn': {
      'pt': 'Qtd da tarefa: ',
      'en': 'Task quantity: ',
      'es': 'Cantidad de tareas: ',
    },
    'tf0rw7ss': {
      'pt': ' ',
      'en': '',
      'es': '',
    },
    '9tuuisp0': {
      'pt': 'Quantidade da tarefa',
      'en': 'Task quantity',
      'es': 'Cantidad de tareas',
    },
    '7ixt33af': {
      'pt': 'Qtd executada: ',
      'en': 'Quantity executed: ',
      'es': 'Cantidad ejecutada: ',
    },
    'e37zprhm': {
      'pt': ' ',
      'en': '',
      'es': '',
    },
    '5he7t49o': {
      'pt': 'Quantidade da tarefa',
      'en': 'Task quantity',
      'es': 'Cantidad de tareas',
    },
    'o3mn115w': {
      'pt': ' - ',
      'en': ' - ',
      'es': ' -  ',
    },
    'iiigcziq': {
      'pt': ' funcionários',
      'en': ' employees',
      'es': ' empleados',
    },
    '09kbqmmp': {
      'pt': 'Campo ',
      'en': 'Field ',
      'es': 'Campo ',
    },
    'cvqnv1sn': {
      'pt': 'Seção ',
      'en': 'Section ',
      'es': 'Sección ',
    },
    'lj11uuv9': {
      'pt': 'Fileira ',
      'en': 'Row ',
      'es': 'Fila ',
    },
    'z6try59t': {
      'pt': 'Tracker ',
      'en': 'Tracker ',
      'es': 'Rastreador ',
    },
    'k74rfc6a': {
      'pt': 'Estaca ',
      'en': 'Stake ',
      'es': 'Apostar ',
    },
    'lhj6x2s7': {
      'pt': 'Detalhe da tarefa',
      'en': 'Task details',
      'es': 'Detalles de la tarea',
    },
    'xynu8sx9': {
      'pt': 'Ver mais',
      'en': 'See more',
      'es': 'Ver más',
    },
    'ryvoyba2': {
      'pt': 'Pendente',
      'en': 'Pending',
      'es': 'Pendiente',
    },
    '8df9at2n': {
      'pt': 'COD',
      'en': 'COD',
      'es': 'BACALAO',
    },
    '01ij9zl6': {
      'pt': 'Tarefa',
      'en': 'Task',
      'es': 'Tarea',
    },
    'zn1wp6nn': {
      'pt': 'Peso',
      'en': 'Weight',
      'es': 'Peso',
    },
    'v5oolpv8': {
      'pt': 'Execução',
      'en': 'Execution',
      'es': 'Ejecución',
    },
    'bg67ns0h': {
      'pt': 'Unidade/Medida',
      'en': 'Unit/Measurement',
      'es': 'Unidad/Medida',
    },
    '7nfnkyav': {
      'pt': 'Disciplina',
      'en': 'Discipline',
      'es': 'Disciplina',
    },
    'oy8n70tk': {
      'pt': 'Localização',
      'en': 'Location',
      'es': 'Ubicación',
    },
    'bpvcx1zg': {
      'pt': 'Campo ',
      'en': 'Field ',
      'es': 'Campo ',
    },
    'jzl7chpw': {
      'pt': 'Seção ',
      'en': 'Section',
      'es': 'Sección',
    },
    'ug9ixufl': {
      'pt': 'Fileira ',
      'en': 'Row ',
      'es': 'Fila ',
    },
    'x2790tni': {
      'pt': 'Tracker ',
      'en': 'Tracker ',
      'es': 'Rastreador ',
    },
    '211z9a6n': {
      'pt': 'Estaca ',
      'en': 'Stake ',
      'es': 'Apostar ',
    },
    'qoui14d3': {
      'pt': 'Em andamento',
      'en': 'In progress',
      'es': 'En curso',
    },
    'y4nihcc8': {
      'pt': 'COD',
      'en': 'COD',
      'es': 'BACALAO',
    },
    '33gzppiv': {
      'pt': 'Tarefa',
      'en': 'Task',
      'es': 'Tarea',
    },
    'dzeudrz4': {
      'pt': 'Peso',
      'en': 'Weight',
      'es': 'Peso',
    },
    'taw5qyce': {
      'pt': 'Execução',
      'en': 'Execution',
      'es': 'Ejecución',
    },
    'itpzf8up': {
      'pt': 'Unidade/Medida',
      'en': 'Unit/Measurement',
      'es': 'Unidad/Medida',
    },
    'y75jk9wi': {
      'pt': 'Disciplina',
      'en': 'Discipline',
      'es': 'Disciplina',
    },
    'ykitrhoj': {
      'pt': 'Localização',
      'en': 'Location',
      'es': 'Ubicación',
    },
    '2a6kddjx': {
      'pt': 'Campo ',
      'en': 'Field ',
      'es': 'Campo ',
    },
    'ut0minog': {
      'pt': 'Seção ',
      'en': 'Section ',
      'es': 'Sección ',
    },
    'gzrqphis': {
      'pt': 'Fileira ',
      'en': 'Row ',
      'es': 'Fila ',
    },
    '9elojsqi': {
      'pt': 'Tracker ',
      'en': 'Tracker ',
      'es': 'Rastreador ',
    },
    'vsg8daj2': {
      'pt': 'Estaca ',
      'en': 'Stake ',
      'es': 'Apostar ',
    },
    'fd06vf3t': {
      'pt': 'Inspeção',
      'en': 'Inspection',
      'es': 'Inspección',
    },
    'ojphazkb': {
      'pt': 'COD',
      'en': 'COD',
      'es': 'BACALAO',
    },
    '9rsyshss': {
      'pt': 'Tarefa',
      'en': 'Task',
      'es': 'Tarea',
    },
    'v72y3g1e': {
      'pt': 'Peso',
      'en': 'Weight',
      'es': 'Peso',
    },
    'b3m8l7pi': {
      'pt': 'Execução',
      'en': 'Execution',
      'es': 'Ejecución',
    },
    'b3uauulk': {
      'pt': 'Unidade/Medida',
      'en': 'Unit/Measurement',
      'es': 'Unidad/Medida',
    },
    '7b0tmfrc': {
      'pt': 'Disciplina',
      'en': 'Discipline',
      'es': 'Disciplina',
    },
    't91ekywo': {
      'pt': 'Localização',
      'en': 'Location',
      'es': 'Ubicación',
    },
    '88jd5nfe': {
      'pt': 'Campo ',
      'en': 'Field ',
      'es': 'Campo ',
    },
    '0qka2nsn': {
      'pt': 'Seção ',
      'en': 'Section ',
      'es': 'Sección ',
    },
    'ndb0kyon': {
      'pt': 'Fileira ',
      'en': 'Row ',
      'es': 'Fila ',
    },
    '2pbnf14e': {
      'pt': 'Tracker ',
      'en': 'Tracker ',
      'es': 'Rastreador ',
    },
    'j8xe80gk': {
      'pt': 'Estaca ',
      'en': 'Stake ',
      'es': 'Apostar ',
    },
    '5yu2m8mk': {
      'pt': 'Sem sucesso',
      'en': 'Unsuccessful',
      'es': 'Fracasado',
    },
    'rnugapyp': {
      'pt': 'COD',
      'en': 'COD',
      'es': 'BACALAO',
    },
    'ukad4c8a': {
      'pt': 'Tarefa',
      'en': 'Task',
      'es': 'Tarea',
    },
    'bxioms2b': {
      'pt': 'Peso',
      'en': 'Weight',
      'es': 'Peso',
    },
    'qoh8ilhk': {
      'pt': 'Execução',
      'en': 'Execution',
      'es': 'Ejecución',
    },
    '79o2yewv': {
      'pt': 'Unidade/Medida',
      'en': 'Unit/Measurement',
      'es': 'Unidad/Medida',
    },
    '7j22orlx': {
      'pt': 'Disciplina',
      'en': 'Discipline',
      'es': 'Disciplina',
    },
    'm6ixvkuz': {
      'pt': 'Localização',
      'en': 'Location',
      'es': 'Ubicación',
    },
    'kg0ccsb9': {
      'pt': 'Campo ',
      'en': 'Field ',
      'es': 'Campo ',
    },
    'djlse6dz': {
      'pt': 'Seção ',
      'en': 'Section ',
      'es': 'Sección ',
    },
    'dmx272uq': {
      'pt': 'Fileira ',
      'en': 'Row ',
      'es': 'Fila ',
    },
    '5m2kamow': {
      'pt': 'Tracker ',
      'en': 'Tracker ',
      'es': 'Rastreador ',
    },
    'q9xnq3w1': {
      'pt': 'Estaca ',
      'en': 'Stake ',
      'es': 'Apostar ',
    },
    'lrc9s3sf': {
      'pt': 'Concluídas',
      'en': 'Completed',
      'es': 'Terminado',
    },
    'skfjxkmd': {
      'pt': 'COD',
      'en': 'COD',
      'es': 'BACALAO',
    },
    'zzvq83t5': {
      'pt': 'Tarefa',
      'en': 'Task',
      'es': 'Tarea',
    },
    'y7gya44p': {
      'pt': 'Peso',
      'en': 'Weight',
      'es': 'Peso',
    },
    'ayawzs7m': {
      'pt': 'Execução',
      'en': 'Execution',
      'es': 'Ejecución',
    },
    'l70gnq61': {
      'pt': 'Unidade/Medida',
      'en': 'Unit/Measurement',
      'es': 'Unidad/Medida',
    },
    '3qfiyllf': {
      'pt': 'Disciplina',
      'en': 'Discipline',
      'es': 'Disciplina',
    },
    'fwujgxq5': {
      'pt': 'Localização',
      'en': 'Location',
      'es': 'Ubicación',
    },
    '9acdtxmb': {
      'pt': 'Campo ',
      'en': 'Field ',
      'es': 'Campo ',
    },
    '78thza2g': {
      'pt': 'Seção ',
      'en': 'Section ',
      'es': 'Sección ',
    },
    'oh5uvfpf': {
      'pt': 'Fileira ',
      'en': 'Row ',
      'es': 'Fila ',
    },
    'a6hp4l9c': {
      'pt': 'Tracker ',
      'en': 'Tracker ',
      'es': 'Rastreador ',
    },
    'ghbs7w55': {
      'pt': 'Estaca ',
      'en': 'Stake ',
      'es': 'Apostar ',
    },
    '6jz3ra10': {
      'pt': 'linhas por página:',
      'en': 'lines per page:',
      'es': 'líneas por página:',
    },
    'lfdve2zs': {
      'pt': '10',
      'en': '10',
      'es': '10',
    },
    'ajy21cj1': {
      'pt': '10',
      'en': '10',
      'es': '10',
    },
    'wkdecqd0': {
      'pt': 'Search...',
      'en': 'Search...',
      'es': 'Buscar...',
    },
    'hbu8pmup': {
      'pt': '5',
      'en': '5',
      'es': '5',
    },
    'rsmj8tex': {
      'pt': '10',
      'en': '10',
      'es': '10',
    },
    '6on4a51d': {
      'pt': '15',
      'en': '15',
      'es': '15',
    },
    '23n4d6tu': {
      'pt': '20',
      'en': '20',
      'es': '20',
    },
    'q9p70vyo': {
      'pt': '100',
      'en': '100',
      'es': '100',
    },
    '7wg8lin2': {
      'pt': 'Home',
      'en': 'Home',
      'es': 'Hogar',
    },
  },
  // Tarefas
  {
    'r2t08avw': {
      'pt': 'Tarefas',
      'en': 'Tasks',
      'es': 'Tareas',
    },
    '1lv5hxuw': {
      'pt':
          'Veja todas as tarefas, filtre para aplicar as ações em grupo ou crie novas tarefas',
      'en':
          'View all tasks, filter to apply actions to groups, or create new tasks.',
      'es':
          'Ver todas las tareas, filtrar para aplicar acciones a grupos o crear nuevas tareas.',
    },
    's54kamsl': {
      'pt': 'Procurar por título da tarefa',
      'en': 'Search by task title',
      'es': 'Buscar por título de la tarea',
    },
    'rguhwt94': {
      'pt': 'Criar Tarefa',
      'en': 'Create Task',
      'es': 'Crear tarea',
    },
    'ux8r3x2z': {
      'pt': 'Filtros',
      'en': 'Filters',
      'es': 'Filtros',
    },
    'qz9o569m': {
      'pt': 'Equipamento',
      'en': 'Equipment',
      'es': 'Equipo',
    },
    'iomyllls': {
      'pt': 'Limpar',
      'en': 'To clean',
      'es': 'Para limpiar',
    },
    'p63dldrl': {
      'pt': 'Disciplina: ',
      'en': 'Discipline: ',
      'es': 'Disciplina: ',
    },
    '8k156z9f': {
      'pt':
          'Título da Tarefa - Breve descrição em poucas linhas sobre o que é essa tarefa',
      'en':
          'Task Title - Brief description in a few lines of what this task is.',
      'es':
          'Título de la tarea: Breve descripción en pocas líneas de lo que es esta tarea.',
    },
    '31hd4t9p': {
      'pt': 'Peso: ',
      'en': 'Weight: ',
      'es': 'Peso: ',
    },
    'e4tbg6pb': {
      'pt':
          'Título da Tarefa - Breve descrição em poucas linhas sobre o que é essa tarefa',
      'en':
          'Task Title - Brief description in a few lines of what this task is.',
      'es':
          'Título de la tarea: Breve descripción en pocas líneas de lo que es esta tarea.',
    },
    '8zdugww1': {
      'pt': 'Home',
      'en': 'Home',
      'es': 'Hogar',
    },
  },
  // CriarProjeto
  {
    'j7dypyrc': {
      'pt': 'Projetos',
      'en': 'Projects',
      'es': 'Proyectos',
    },
    '6m73oqsj': {
      'pt': 'Informações principais da obra',
      'en': 'Key information about the work',
      'es': 'Información clave sobre la obra',
    },
    'bvezfrux': {
      'pt': 'Criar projeto',
      'en': 'Create project',
      'es': 'Crear proyecto',
    },
    '1g3kas24': {
      'pt':
          'Para criar um projeto novo, precisamos preencher todas as informações contidas no CNO - Cadastro Nacional de Obras',
      'en':
          'To create a new project, we need to fill in all the information contained in the CNO - National Registry of Works.',
      'es':
          'Para crear un nuevo proyecto, necesitamos completar toda la información contenida en el CNO - Registro Nacional de Obras.',
    },
    'pl2weru4': {
      'pt': 'CNO - Cadastro Nacional de Obras',
      'en': 'CNO - National Registry of Works',
      'es': 'CNO - Registro Nacional de Obras',
    },
    '2oiqp3on': {
      'pt': 'Que tal começar fazendo upload do documento? ',
      'en': 'How about starting by uploading the document?',
      'es': '¿Qué tal empezar subiendo el documento?',
    },
    'z7viqggd': {
      'pt': 'Faça upload do documento CNO - Cadastro Nacional de Obras',
      'en': 'Upload the CNO document - National Registry of Works.',
      'es': 'Cargar el documento CNO – Registro Nacional de Obras.',
    },
    'j1az1bv4': {
      'pt': '*Campo obrigatório',
      'en': '*Required field',
      'es': '*Campo obligatorio',
    },
    'ly49ma2d': {
      'pt': 'Informações da obra',
      'en': 'Information about the work',
      'es': 'Información sobre la obra',
    },
    'nq465lrm': {
      'pt':
          'Você pode checar se as informações foram preenchidas, editá-las ou acrescentar o que faltou.',
      'en':
          'You can check if the information has been filled in, edit it, or add anything that is missing.',
      'es':
          'Podrás comprobar si la información se ha completado, editarla o añadir aquello que falte.',
    },
    'rmrb8k5e': {
      'pt': 'Número de inscrição do projeto',
      'en': 'Project registration number',
      'es': 'Número de registro del proyecto',
    },
    'nh6pd7pg': {
      'pt': 'Digite aqui',
      'en': 'Type here',
      'es': 'Escribe aquí',
    },
    'r81aeq1e': {
      'pt': 'Nome da obra',
      'en': 'Title of the work',
      'es': 'Título de la obra',
    },
    'w1otbe7i': {
      'pt': 'Digite aqui',
      'en': 'Type here',
      'es': 'Escribe aquí',
    },
    'g0qlcvp0': {
      'pt': 'Origem do cadastramento',
      'en': 'Origin of registration',
      'es': 'Origen del registro',
    },
    'owfv6pdj': {
      'pt': 'Digite aqui',
      'en': 'Type here',
      'es': 'Escribe aquí',
    },
    'ke91l1pd': {
      'pt': 'ART',
      'en': 'ART',
      'es': 'ARTE',
    },
    '8r23splq': {
      'pt': 'Digite aqui',
      'en': 'Type here',
      'es': 'Escribe aquí',
    },
    '7ewwd4ih': {
      'pt': 'RRT',
      'en': 'RRT',
      'es': 'TRR',
    },
    'yw8eslbg': {
      'pt': 'Digite aqui',
      'en': 'Type here',
      'es': 'Escribe aquí',
    },
    'mh00c7x8': {
      'pt': 'CIB',
      'en': 'CIB',
      'es': 'CIB',
    },
    'f9b4k0ml': {
      'pt': 'Digite aqui',
      'en': 'Type here',
      'es': 'Escribe aquí',
    },
    'lr2dmltb': {
      'pt': 'Cadastro imobiliário',
      'en': 'Real estate registry',
      'es': 'Registro de la propiedad inmobiliaria',
    },
    '0blfe32x': {
      'pt': 'Digite aqui',
      'en': 'Type here',
      'es': 'Escribe aquí',
    },
    'k493mnbt': {
      'pt': 'Data do início da obra',
      'en': 'Start date of construction',
      'es': 'Fecha de inicio de la construcción',
    },
    '898ahvsu': {
      'pt': 'XX/XX/XXXX',
      'en': 'XX/XX/XXXX',
      'es': 'XX/XX/XXXX',
    },
    '9ddcid56': {
      'pt': '*Data invalida.',
      'en': 'Invalid date.',
      'es': 'Fecha inválida.',
    },
    'nay1z88a': {
      'pt': 'CNAE',
      'en': 'CNAE',
      'es': 'CNAE',
    },
    'unqip356': {
      'pt': 'Digite aqui',
      'en': 'Type here',
      'es': 'Escribe aquí',
    },
    '0dprq82d': {
      'pt': 'Alvará',
      'en': 'License',
      'es': 'Licencia',
    },
    'f367velr': {
      'pt':
          'Você pode checar se as informações foram preenchidas automaticamente, editá-las ou acrescentar o que faltou.',
      'en':
          'You can check if the information was automatically filled in, edit it, or add anything that was missing.',
      'es':
          'Puedes comprobar si la información se completó automáticamente, editarla o agregar cualquier cosa que faltara.',
    },
    'kp74fqua': {
      'pt': 'Número do alvará',
      'en': 'License number',
      'es': 'Número de licencia',
    },
    'nsxs8yk3': {
      'pt': 'Digite aqui',
      'en': 'Type here',
      'es': 'Escribe aquí',
    },
    '3aihzlp7': {
      'pt': 'Situação da obra',
      'en': 'Project status',
      'es': 'Estado del proyecto',
    },
    'y834emw0': {
      'pt':
          'Você pode checar se as informações foram preenchidas automaticamente, editá-las ou acrescentar o que faltou.',
      'en':
          'You can check if the information was automatically filled in, edit it, or add anything that was missing.',
      'es':
          'Puedes comprobar si la información se completó automáticamente, editarla o agregar cualquier cosa que faltara.',
    },
    'sz9t78wa': {
      'pt': 'Situação',
      'en': 'Situation',
      'es': 'Situación',
    },
    'qichj59h': {
      'pt': 'Selecione uma opção',
      'en': 'Select an option',
      'es': 'Seleccione una opción',
    },
    '5x5nwgnf': {
      'pt': 'Search...',
      'en': 'Search...',
      'es': 'Buscar...',
    },
    'qcdvl9jb': {
      'pt': '*Campo obrigatório',
      'en': '*Required field',
      'es': '*Campo obligatorio',
    },
    'uz2y9gm2': {
      'pt': 'Data',
      'en': 'Date',
      'es': 'Fecha',
    },
    'v19n1ii3': {
      'pt': 'XX/XX/XXXX',
      'en': 'XX/XX/XXXX',
      'es': 'XX/XX/XXXX',
    },
    'fnkoiy7q': {
      'pt': '*Data invalida.',
      'en': 'Invalid date.',
      'es': 'Fecha inválida.',
    },
    'pcewf1sj': {
      'pt': 'Responsável',
      'en': 'Responsible',
      'es': 'Responsable',
    },
    'l3auzrl0': {
      'pt':
          'Você pode checar se as informações foram preenchidas automaticamente, editá-las ou acrescentar o que faltou.',
      'en':
          'You can check if the information was automatically filled in, edit it, or add anything that was missing.',
      'es':
          'Puedes comprobar si la información se completó automáticamente, editarla o agregar cualquier cosa que faltara.',
    },
    'cwo4qd0d': {
      'pt': 'Responsável',
      'en': 'Responsible',
      'es': 'Responsable',
    },
    'ugiirwme': {
      'pt': 'CPF/CNPJ',
      'en': 'CPF/CNPJ',
      'es': 'CPF/CNPJ',
    },
    'uks0y9h6': {
      'pt': 'Digite aqui',
      'en': 'Type here',
      'es': 'Escribe aquí',
    },
    '05k5syem': {
      'pt': 'Digite aqui',
      'en': 'Type here',
      'es': 'Escribe aquí',
    },
    'be0hql7w': {
      'pt': 'Endereço',
      'en': 'Address',
      'es': 'DIRECCIÓN',
    },
    'ykqgrfzk': {
      'pt':
          'Você pode checar se as informações foram preenchidas automaticamente, editá-las ou acrescentar o que faltou.',
      'en':
          'You can check if the information was automatically filled in, edit it, or add anything that was missing.',
      'es':
          'Puedes comprobar si la información se completó automáticamente, editarla o agregar cualquier cosa que faltara.',
    },
    'p0ea9rc2': {
      'pt': 'CEP',
      'en': 'ZIP code',
      'es': 'Código postal',
    },
    'dktyd07v': {
      'pt': 'Digite aqui',
      'en': 'Type here',
      'es': 'Escribe aquí',
    },
    '9pzhq5nu': {
      'pt': 'Logradouro',
      'en': 'Street',
      'es': 'Calle',
    },
    'lcd3w687': {
      'pt': 'Digite aqui',
      'en': 'Type here',
      'es': 'Escribe aquí',
    },
    'jp9y5h65': {
      'pt': 'Número',
      'en': 'Number',
      'es': 'Número',
    },
    'did1zszr': {
      'pt': 'Digite aqui',
      'en': 'Type here',
      'es': 'Escribe aquí',
    },
    '5lvltzae': {
      'pt': 'Bairro',
      'en': 'Neighborhood',
      'es': 'Vecindario',
    },
    '0mmkual8': {
      'pt': 'Digite aqui',
      'en': 'Type here',
      'es': 'Escribe aquí',
    },
    't8rwxmo5': {
      'pt': 'Município',
      'en': 'Municipality',
      'es': 'Municipio',
    },
    'ure4775o': {
      'pt': 'Digite aqui',
      'en': 'Type here',
      'es': 'Escribe aquí',
    },
    '35pdto98': {
      'pt': 'UF',
      'en': 'UF',
      'es': 'UF',
    },
    '1i0b4foy': {
      'pt': 'Digite aqui',
      'en': 'Type here',
      'es': 'Escribe aquí',
    },
    'trra1fyl': {
      'pt': 'País',
      'en': 'Country',
      'es': 'País',
    },
    '1zt8m866': {
      'pt': 'Digite aqui',
      'en': 'Type here',
      'es': 'Escribe aquí',
    },
    'zm613lp1': {
      'pt': 'Complemento',
      'en': 'Supplement',
      'es': 'Suplemento',
    },
    'l4b6qqtk': {
      'pt': 'Digite aqui',
      'en': 'Type here',
      'es': 'Escribe aquí',
    },
    'c948pfks': {
      'pt': 'Áreas principais',
      'en': 'Main areas',
      'es': 'Áreas principales',
    },
    'isd245y1': {
      'pt':
          'Você pode checar se as informações foram preenchidas automaticamente, editá-las ou acrescentar o que faltou.',
      'en':
          'You can check if the information was automatically filled in, edit it, or add anything that was missing.',
      'es':
          'Puedes comprobar si la información se completó automáticamente, editarla o agregar cualquier cosa que faltara.',
    },
    'kcnmpkow': {
      'pt': 'Categoria',
      'en': 'Category',
      'es': 'Categoría',
    },
    '68pifgu9': {
      'pt': 'Digite aqui',
      'en': 'Type here',
      'es': 'Escribe aquí',
    },
    'gmv7h7nq': {
      'pt': 'Destinação',
      'en': 'Destination',
      'es': 'Destino',
    },
    'olxpyc0q': {
      'pt': 'Digite aqui',
      'en': 'Type here',
      'es': 'Escribe aquí',
    },
    '6xsgbhge': {
      'pt': 'Tipo de obra',
      'en': 'Type of work',
      'es': 'Tipo de trabajo',
    },
    'fsayp1pp': {
      'pt': 'Digite aqui',
      'en': 'Type here',
      'es': 'Escribe aquí',
    },
    'k7mkcd07': {
      'pt': 'Área resultante da obra',
      'en': 'Area resulting from the work',
      'es': 'Área resultante de la obra',
    },
    'ij6ud19k': {
      'pt': 'Digite aqui',
      'en': 'Type here',
      'es': 'Escribe aquí',
    },
    'bp7h8l4e': {
      'pt': 'Criar projeto',
      'en': 'Create project',
      'es': 'Crear proyecto',
    },
    '3fjj83id': {
      'pt': 'Erro!',
      'en': 'Error!',
      'es': '¡Error!',
    },
    'u14u0ft9': {
      'pt': '*Campo obrigatório',
      'en': '*Required field',
      'es': '*Campo obligatorio',
    },
    'bo5dknnu': {
      'pt': 'Please choose an option from the dropdown',
      'en': 'Please choose an option from the dropdown',
      'es': 'Por favor, elija una opción del menú desplegable.',
    },
    'wg8gcxtw': {
      'pt': '*Campo obrigatório',
      'en': '*Required field',
      'es': '*Campo obligatorio',
    },
    'ymxosir6': {
      'pt': 'Please choose an option from the dropdown',
      'en': 'Please choose an option from the dropdown',
      'es': 'Por favor, elija una opción del menú desplegable.',
    },
    'f97guhvd': {
      'pt': '*Campo obrigatório',
      'en': '*Required field',
      'es': '*Campo obligatorio',
    },
    '2dwv4lk9': {
      'pt': 'Please choose an option from the dropdown',
      'en': 'Please choose an option from the dropdown',
      'es': 'Por favor, elija una opción del menú desplegable.',
    },
    '49be3ur1': {
      'pt': '*Campo obrigatório',
      'en': '*Required field',
      'es': '*Campo obligatorio',
    },
    'a4oqdzjm': {
      'pt': 'Please choose an option from the dropdown',
      'en': 'Please choose an option from the dropdown',
      'es': 'Por favor, elija una opción del menú desplegable.',
    },
    'og02fdbk': {
      'pt': '*Campo obrigatório',
      'en': '*Required field',
      'es': '*Campo obligatorio',
    },
    'vxlmwga8': {
      'pt': 'Please choose an option from the dropdown',
      'en': 'Please choose an option from the dropdown',
      'es': 'Por favor, elija una opción del menú desplegable.',
    },
    'xks84osr': {
      'pt': '*Campo obrigatório',
      'en': '*Required field',
      'es': '*Campo obligatorio',
    },
    'iixdaga3': {
      'pt': 'Please choose an option from the dropdown',
      'en': 'Please choose an option from the dropdown',
      'es': 'Por favor, elija una opción del menú desplegable.',
    },
    '3iab90hq': {
      'pt': '*Campo obrigatório',
      'en': '*Required field',
      'es': '*Campo obligatorio',
    },
    '9yplzu1k': {
      'pt': 'Please choose an option from the dropdown',
      'en': 'Please choose an option from the dropdown',
      'es': 'Por favor, elija una opción del menú desplegable.',
    },
    '718u6i5k': {
      'pt': '*Campo obrigatório',
      'en': '*Required field',
      'es': '*Campo obligatorio',
    },
    'bsr8ho7a': {
      'pt': 'Please choose an option from the dropdown',
      'en': 'Please choose an option from the dropdown',
      'es': 'Por favor, elija una opción del menú desplegable.',
    },
    'ckm1dm55': {
      'pt': '*Campo obrigatório',
      'en': '*Required field',
      'es': '*Campo obligatorio',
    },
    'jl41f510': {
      'pt': 'Please choose an option from the dropdown',
      'en': 'Please choose an option from the dropdown',
      'es': 'Por favor, elija una opción del menú desplegable.',
    },
    'vt2j19py': {
      'pt': '*Campo obrigatório',
      'en': '*Required field',
      'es': '*Campo obligatorio',
    },
    '8828hdxb': {
      'pt': 'Please choose an option from the dropdown',
      'en': 'Please choose an option from the dropdown',
      'es': 'Por favor, elija una opción del menú desplegable.',
    },
    'llt5if48': {
      'pt': '*Campo obrigatório',
      'en': '*Required field',
      'es': '*Campo obligatorio',
    },
    'trakof9j': {
      'pt': 'Please choose an option from the dropdown',
      'en': 'Please choose an option from the dropdown',
      'es': 'Por favor, elija una opción del menú desplegable.',
    },
    'lnh1ir65': {
      'pt': '*Campo obrigatório',
      'en': '*Required field',
      'es': '*Campo obligatorio',
    },
    'yziks5hm': {
      'pt': 'Please choose an option from the dropdown',
      'en': 'Please choose an option from the dropdown',
      'es': 'Por favor, elija una opción del menú desplegable.',
    },
    'vjbblzi2': {
      'pt': '*Campo obrigatório',
      'en': '*Required field',
      'es': '*Campo obligatorio',
    },
    'o7ysp0yz': {
      'pt': 'Please choose an option from the dropdown',
      'en': 'Please choose an option from the dropdown',
      'es': 'Por favor, elija una opción del menú desplegable.',
    },
    'bwpd5yty': {
      'pt': '*Campo obrigatório',
      'en': '*Required field',
      'es': '*Campo obligatorio',
    },
    '5yhulhhw': {
      'pt': 'Please choose an option from the dropdown',
      'en': 'Please choose an option from the dropdown',
      'es': 'Por favor, elija una opción del menú desplegable.',
    },
    'q0syaeq5': {
      'pt': '*Campo obrigatório',
      'en': '*Required field',
      'es': '*Campo obligatorio',
    },
    'ora7r71u': {
      'pt': 'Please choose an option from the dropdown',
      'en': 'Please choose an option from the dropdown',
      'es': 'Por favor, elija una opción del menú desplegable.',
    },
    'dedc5hq7': {
      'pt': '*Campo obrigatório',
      'en': '*Required field',
      'es': '*Campo obligatorio',
    },
    '70lk2ajo': {
      'pt': 'Please choose an option from the dropdown',
      'en': 'Please choose an option from the dropdown',
      'es': 'Por favor, elija una opción del menú desplegable.',
    },
    'ql95tdeo': {
      'pt': '*Campo obrigatório',
      'en': '*Required field',
      'es': '*Campo obligatorio',
    },
    'gamht4b7': {
      'pt': 'Please choose an option from the dropdown',
      'en': 'Please choose an option from the dropdown',
      'es': 'Por favor, elija una opción del menú desplegable.',
    },
    '3kgv4sp7': {
      'pt': '*Campo obrigatório',
      'en': '*Required field',
      'es': '*Campo obligatorio',
    },
    'ub36m5js': {
      'pt': 'Please choose an option from the dropdown',
      'en': 'Please choose an option from the dropdown',
      'es': 'Por favor, elija una opción del menú desplegable.',
    },
    'dm98xkmr': {
      'pt': '*Campo obrigatório',
      'en': '*Required field',
      'es': '*Campo obligatorio',
    },
    'nrthtkq7': {
      'pt': 'Please choose an option from the dropdown',
      'en': 'Please choose an option from the dropdown',
      'es': 'Por favor, elija una opción del menú desplegable.',
    },
    '1ji0ozoo': {
      'pt': '*Campo obrigatório',
      'en': '*Required field',
      'es': '*Campo obligatorio',
    },
    '22pdy6d0': {
      'pt': 'Please choose an option from the dropdown',
      'en': 'Please choose an option from the dropdown',
      'es': 'Por favor, elija una opción del menú desplegable.',
    },
    '9m9wc1ol': {
      'pt': '*Campo obrigatório',
      'en': '*Required field',
      'es': '*Campo obligatorio',
    },
    'ezzf00wn': {
      'pt': 'Please choose an option from the dropdown',
      'en': 'Please choose an option from the dropdown',
      'es': 'Por favor, elija una opción del menú desplegable.',
    },
    'gpn5yjvp': {
      'pt': '*Campo obrigatório',
      'en': '*Required field',
      'es': '*Campo obligatorio',
    },
    '4zuz5bc3': {
      'pt': 'Please choose an option from the dropdown',
      'en': 'Please choose an option from the dropdown',
      'es': 'Por favor, elija una opción del menú desplegable.',
    },
    '72ol28c2': {
      'pt': 'Digite aqui is required',
      'en': 'Type here is required',
      'es': 'El tipo aquí es obligatorio',
    },
    'gxbbdxcz': {
      'pt': 'Please choose an option from the dropdown',
      'en': 'Please choose an option from the dropdown',
      'es': 'Por favor, elija una opción del menú desplegable.',
    },
    'b1m53571': {
      'pt': '*Campo obrigatório',
      'en': '*Required field',
      'es': '*Campo obligatorio',
    },
    'jlz1v66q': {
      'pt': 'Please choose an option from the dropdown',
      'en': 'Please choose an option from the dropdown',
      'es': 'Por favor, elija una opción del menú desplegable.',
    },
    '1z3jvahv': {
      'pt': '*Campo obrigatório',
      'en': '*Required field',
      'es': '*Campo obligatorio',
    },
    'xm098ns6': {
      'pt': 'Please choose an option from the dropdown',
      'en': 'Please choose an option from the dropdown',
      'es': 'Por favor, elija una opción del menú desplegable.',
    },
    '0mbc5yx8': {
      'pt': '*Campo obrigatório',
      'en': '*Required field',
      'es': '*Campo obligatorio',
    },
    'cxdad96l': {
      'pt': 'Please choose an option from the dropdown',
      'en': 'Please choose an option from the dropdown',
      'es': 'Por favor, elija una opción del menú desplegable.',
    },
    'elmzeuj8': {
      'pt': '*Campo obrigatório',
      'en': '*Required field',
      'es': '*Campo obligatorio',
    },
    'hmz3mu7n': {
      'pt': 'Please choose an option from the dropdown',
      'en': 'Please choose an option from the dropdown',
      'es': 'Por favor, elija una opción del menú desplegable.',
    },
    'k7ha9e52': {
      'pt': 'Home',
      'en': 'Home',
      'es': 'Hogar',
    },
  },
  // CadastrarEditarTrackerCopy2
  {
    '9o30jbny': {
      'pt': 'Trackers',
      'en': 'Trackers',
      'es': 'Rastreadores',
    },
    '430qljin': {
      'pt': 'Detalhes do Tracker',
      'en': 'Tracker Details',
      'es': 'Detalles del rastreador',
    },
    'hijtk8f5': {
      'pt': 'Detalhes do Tracker',
      'en': 'Tracker Details',
      'es': 'Detalles del rastreador',
    },
    'j0hpinn1': {
      'pt': '{{descrição do projeto}}',
      'en': '{{project description}}',
      'es': '{{descripción del proyecto}}',
    },
    'cy7gmq9v': {
      'pt': 'Informações',
      'en': 'Information',
      'es': 'Información',
    },
    '45vt3n7x': {
      'pt': 'Fabricante',
      'en': 'Manufacturer',
      'es': 'Fabricante',
    },
    '7j4titk2': {
      'pt': '* Campo obrigatório',
      'en': '* Required field',
      'es': '* Campo obligatorio',
    },
    'qmwo4rkz': {
      'pt': 'Tipo de tracker',
      'en': 'Tracker type',
      'es': 'Tipo de rastreador',
    },
    'ensynnl2': {
      'pt': '* Campo obrigatório',
      'en': '* Required field',
      'es': '* Campo obligatorio',
    },
    'uywraqae': {
      'pt': 'Quantidade máxima de módulos',
      'en': 'Maximum number of modules',
      'es': 'Número máximo de módulos',
    },
    '0bieuyn4': {
      'pt': 'Digite aqui',
      'en': 'Type here',
      'es': 'Escribe aquí',
    },
    'g01tky5u': {
      'pt': '* Digite uma quantidade diferente de 0',
      'en': '* Enter a quantity other than 0',
      'es': '* Ingrese una cantidad distinta a 0',
    },
    '1zv6ufy3': {
      'pt': 'Quantidade de estacas',
      'en': 'Number of stakes',
      'es': 'Número de participaciones',
    },
    'je6rntn0': {
      'pt': 'Digite aqui',
      'en': 'Type here',
      'es': 'Escribe aquí',
    },
    'mi51cknq': {
      'pt': 'Atenção!',
      'en': 'Attention!',
      'es': '¡Atención!',
    },
    'xopwrb8x': {
      'pt':
          'Você está definindo um valor menor do que o existente. Isso removerá as estacas excedentes criadas. Se deseja continuar, clique em \"Confirmar\".',
      'en':
          'You are setting a value lower than the existing one. This will remove the excess stakes that were created. If you wish to continue, click \"Confirm\".',
      'es':
          'Estás configurando un valor inferior al actual. Esto eliminará las apuestas adicionales creadas. Si deseas continuar, haz clic en \"Confirmar\".',
    },
    'iylagvgb': {
      'pt': '* Digite uma quantidade diferente de 0',
      'en': '* Enter a quantity other than 0',
      'es': '* Ingrese una cantidad distinta a 0',
    },
    'g1ygsu79': {
      'pt': '* Campo obrigatório',
      'en': '* Required field',
      'es': '* Campo obligatorio',
    },
    '7vk63ef8': {
      'pt': 'Please choose an option from the dropdown',
      'en': 'Please choose an option from the dropdown',
      'es': 'Por favor, elija una opción del menú desplegable.',
    },
    'e0hnjwzs': {
      'pt': '* Campo obrigatório',
      'en': '* Required field',
      'es': '* Campo obligatorio',
    },
    'swe30b64': {
      'pt': 'Please choose an option from the dropdown',
      'en': 'Please choose an option from the dropdown',
      'es': 'Por favor, elija una opción del menú desplegable.',
    },
    'vjnn7rqs': {
      'pt': 'Adicione as estacas em sequência',
      'en': 'Add the stakes in sequence.',
      'es': 'Añade las estacas en secuencia.',
    },
    'e3fx5tnr': {
      'pt': 'Posição',
      'en': 'Position',
      'es': 'Posición',
    },
    '1508i0i1': {
      'pt': 'Estacas',
      'en': 'Stakes',
      'es': 'Estacas',
    },
    '8nq5534m': {
      'pt': 'Ações',
      'en': 'Actions',
      'es': 'Comportamiento',
    },
    'mgjwahiq': {
      'pt': 'Deseja remover  essa estaca?',
      'en': 'Do you want to remove this stake?',
      'es': '¿Quieres eliminar esta estaca?',
    },
    '2o362qa4': {
      'pt': 'Clique em confirmar para remover a estaca.',
      'en': 'Click confirm to remove the stake.',
      'es': 'Haga clic en confirmar para eliminar la apuesta.',
    },
    'yoj61o86': {
      'pt': 'Add estaca',
      'en': 'Add stake',
      'es': 'Añadir participación',
    },
    'llqt80jp': {
      'pt': '* Campo obrigatório',
      'en': '* Required field',
      'es': '* Campo obligatorio',
    },
    'yslnjqpj': {
      'pt': 'Deseja remover  essa estaca?',
      'en': 'Do you want to remove this stake?',
      'es': '¿Quieres eliminar esta estaca?',
    },
    'm74yas5e': {
      'pt': 'Clique em confirmar para remover a estaca.',
      'en': 'Click confirm to remove the stake.',
      'es': 'Haga clic en confirmar para eliminar la apuesta.',
    },
    'mtfyka9u': {
      'pt': 'Erro!',
      'en': 'Error!',
      'es': '¡Error!',
    },
    't0wuh50f': {
      'pt': 'Add estaca',
      'en': 'Add stake',
      'es': 'Añadir participación',
    },
    'dsrktmow': {
      'pt': '* Campo obrigatório',
      'en': '* Required field',
      'es': '* Campo obligatorio',
    },
    'kemsubba': {
      'pt': 'Erro!',
      'en': 'Error!',
      'es': '¡Error!',
    },
    'fisz6z14': {
      'pt': 'Erro!',
      'en': 'Error!',
      'es': '¡Error!',
    },
    'luj0nwpk': {
      'pt': 'Home',
      'en': 'Home',
      'es': 'Hogar',
    },
  },
  // Relatorio
  {
    'gzf3p7lk': {
      'pt': 'Projetos',
      'en': 'Projects',
      'es': 'Proyectos',
    },
    '9v5binto': {
      'pt': 'Relatórios',
      'en': 'Reports',
      'es': 'Informes',
    },
    'hlp43uez': {
      'pt': 'Relatórios Diároo de Obras',
      'en': 'Daily Work Reports',
      'es': 'Informes diarios de trabajo',
    },
    'cwdivxz4': {
      'pt':
          'Acompanhe o trabalho restante total e projete a probabilidade de alcançar a meta do sprint. Isso ajuda sua equipe a gerenciar o andamento e responder adequadamente.',
      'en':
          'Track the total remaining work and project the likelihood of achieving the sprint goal. This helps your team manage progress and respond appropriately.',
      'es':
          'Monitorea el trabajo restante total y proyecta la probabilidad de alcanzar el objetivo del sprint. Esto ayuda a tu equipo a gestionar el progreso y responder adecuadamente.',
    },
    'u1ssrvh7': {
      'pt': 'Filtros',
      'en': 'Filters',
      'es': 'Filtros',
    },
    '8nht2cer': {
      'pt': 'Data',
      'en': 'Date',
      'es': 'Fecha',
    },
    '4e75phwc': {
      'pt': 'Limpar',
      'en': 'To clean',
      'es': 'Para limpiar',
    },
    '0ha8dbbp': {
      'pt': 'Criar RDO',
      'en': 'Create RDO',
      'es': 'Crear RDO',
    },
    '27h6ziii': {
      'pt': 'RDO Pendente',
      'en': 'RDO Pending',
      'es': 'RDO pendiente',
    },
    'an7fdnt8': {
      'pt': 'Procurar por nome do líder de equipe',
      'en': 'Search by team leader\'s name',
      'es': 'Buscar por nombre del líder del equipo',
    },
    '3n854tue': {
      'pt': 'RDO',
      'en': 'RDO',
      'es': 'RDO',
    },
    '9s7nybtr': {
      'pt': 'Data de criação',
      'en': 'Creation date',
      'es': 'Fecha de creación',
    },
    'tp4c3xhe': {
      'pt': 'Data de referencia',
      'en': 'Reference date',
      'es': 'Fecha de referencia',
    },
    'duadsg1m': {
      'pt': 'Sprint',
      'en': 'Sprint',
      'es': 'Sprint',
    },
    'ien0113z': {
      'pt': 'Porcentagem de conclusão das tarefas',
      'en': 'Percentage of task completion',
      'es': 'Porcentaje de finalización de tareas',
    },
    'n1n95ewq': {
      'pt': 'Ação',
      'en': 'Action',
      'es': 'Acción',
    },
    'cguohczs': {
      'pt': 'linhas por página:',
      'en': 'lines per page:',
      'es': 'líneas por página:',
    },
    'l02ocpt0': {
      'pt': '10',
      'en': '10',
      'es': '10',
    },
    '1cvyrmq5': {
      'pt': 'Search...',
      'en': 'Search...',
      'es': 'Buscar...',
    },
    'gkbseg2s': {
      'pt': '5',
      'en': '5',
      'es': '5',
    },
    'gt86ypfh': {
      'pt': '10',
      'en': '10',
      'es': '10',
    },
    'ip1d528x': {
      'pt': '15',
      'en': '15',
      'es': '15',
    },
    'vv6or96s': {
      'pt': '20',
      'en': '20',
      'es': '20',
    },
    'qxk35clg': {
      'pt': 'Home',
      'en': 'Home',
      'es': 'Hogar',
    },
  },
  // Dashboard
  {
    'is6i3knq': {
      'pt': 'Home',
      'en': 'Home',
      'es': 'Hogar',
    },
  },
  // InformeDiariasProd
  {
    'mgc056t5': {
      'pt': 'Projetos',
      'en': 'Projects',
      'es': 'Proyectos',
    },
    'hchg4gnt': {
      'pt': 'Informe diárias de produção',
      'en': 'Report daily production figures.',
      'es': 'Reportar cifras diarias de producción.',
    },
    '8udcokt9': {
      'pt': 'Informe diárias de produção',
      'en': 'Report daily production figures.',
      'es': 'Reportar cifras diarias de producción.',
    },
    '0xn2yz2h': {
      'pt': 'Veja todas informações diárias de produção.',
      'en': 'View all daily production information.',
      'es': 'Ver toda la información de producción diaria.',
    },
    '6xcdhrbw': {
      'pt': 'Descrição',
      'en': 'Description',
      'es': 'Descripción',
    },
    'k63lq11a': {
      'pt': 'Qtde executada dia',
      'en': 'Quantity executed per day',
      'es': 'Cantidad ejecutada por día',
    },
    '1spiz8uz': {
      'pt': 'Qtde executado acumulado',
      'en': 'Cumulative quantity executed',
      'es': 'Cantidad acumulada ejecutada',
    },
    'iqgn7k4e': {
      'pt': 'Qtde prevista total',
      'en': 'Total expected quantity',
      'es': 'Cantidad total esperada',
    },
    'kjwpwt61': {
      'pt': 'Avanço %',
      'en': 'Progress %',
      'es': 'Aumento porcentual',
    },
    'jl2rjewq': {
      'pt': 'Data de inicio',
      'en': 'Start date',
      'es': 'Fecha de inicio',
    },
    'qbo9nb8m': {
      'pt': 'Data de concluido',
      'en': 'Completion date',
      'es': 'Fecha de finalización',
    },
    '7hmbypm0': {
      'pt': 'Rendimento médio periodo',
      'en': 'Average yield period',
      'es': 'Período de rendimiento promedio',
    },
    '14oofawu': {
      'pt': 'Rendimento médio do período',
      'en': 'Average return for the period',
      'es': 'Rendimiento promedio del período',
    },
    'pjb59gh1': {
      'pt': '-',
      'en': '-',
      'es': '-',
    },
    'e7eqdrif': {
      'pt': '-',
      'en': '-',
      'es': '-',
    },
    'ydceckdj': {
      'pt': '-',
      'en': '-',
      'es': '-',
    },
    '729h90ea': {
      'pt': '15.107',
      'en': '15.107',
      'es': '15.107',
    },
    'f0xnwg3e': {
      'pt': 'Home',
      'en': 'Home',
      'es': 'Hogar',
    },
  },
  // page_price
  {
    '0hg2zoko': {
      'pt': 'Fazer Login',
      'en': 'Log in',
      'es': 'Acceso',
    },
    'oja0p428': {
      'pt': 'Gestão Solar Inteligente e Automatizada',
      'en': 'Intelligent and Automated Solar Management',
      'es': 'Gestión solar inteligente y automatizada',
    },
    '51hleoeh': {
      'pt':
          'Cadastre trackers, módulos e funcionários. Gerencie sprints, backlog e estoque. Sistema web + aplicativo mobile para execução de tarefas em campo.',
      'en':
          'Register trackers, modules, and employees. Manage sprints, backlog, and inventory. Web system + mobile app for executing tasks in the field.',
      'es':
          'Registra rastreadores, módulos y empleados. Gestiona sprints, backlog e inventario. Sistema web + app móvil para ejecutar tareas en campo.',
    },
    'cqqaxhce': {
      'pt': 'Gratuito',
      'en': 'Free',
      'es': 'Gratis',
    },
    'oaptpjzd': {
      'pt': 'Para começar e explorar',
      'en': 'To begin and explore',
      'es': 'Para comenzar y explorar',
    },
    'xsju7rw5': {
      'pt': 'R\$ 0',
      'en': 'R\$ 0',
      'es': '0 reales',
    },
    'r0pjozi0': {
      'pt': '/mês',
      'en': '/month',
      'es': '/mes',
    },
    'oacbd549': {
      'pt': 'Hello World',
      'en': 'Hello World',
      'es': 'Hola Mundo',
    },
    'qzbclzhv': {
      'pt': '100 consultas à IA por mês',
      'en': '100 AI queries per month',
      'es': '100 consultas de IA al mes',
    },
    'x5pw533e': {
      'pt': '1 projeto',
      'en': '1 project',
      'es': '1 proyecto',
    },
    'dm02qy3k': {
      'pt': 'Até 3 tracker',
      'en': 'Up to 3 trackers',
      'es': 'Hasta 3 rastreadores',
    },
    'ethpzajo': {
      'pt': 'Até 3 módulos',
      'en': 'Up to 3 modules',
      'es': 'Hasta 3 módulos',
    },
    'e0thy8hq': {
      'pt': 'Até 3 funcionários',
      'en': 'Up to 3 employees',
      'es': 'Hasta 3 empleados',
    },
    '5cav5p1k': {
      'pt': 'Sistema web básico',
      'en': 'Basic web system',
      'es': 'Sistema web básico',
    },
    'xz80rv49': {
      'pt': 'Começar Agora',
      'en': 'Start Now',
      'es': 'Empieza ahora',
    },
    '4cc2m5vd': {
      'pt': 'Free trial\n',
      'en': 'R\$ 199',
      'es': '199 reales',
    },
    'utmjdjcy': {
      'pt': 'R\$ 199',
      'en': '',
      'es': '',
    },
    'ti9xi68j': {
      'pt': '/mês',
      'en': '/month',
      'es': '/mes',
    },
    '6n710oru': {
      'pt': 'Hello World',
      'en': 'Hello World',
      'es': 'Hola Mundo',
    },
    'ggorzt55': {
      'pt': 'Consultas ilimitadas à IA',
      'en': 'Unlimited AI queries',
      'es': 'Consultas de IA ilimitadas',
    },
    'dlr6tpan': {
      'pt': 'Projetos ilimitados',
      'en': 'Unlimited projects',
      'es': 'Proyectos ilimitados',
    },
    'na7vzkv0': {
      'pt': 'Mapa de trackers avançado',
      'en': 'Advanced tracker map',
      'es': 'Mapa de seguimiento avanzado',
    },
    'sny05fk7': {
      'pt': 'Gestão de sprints e backlog',
      'en': 'Sprint and backlog management',
      'es': 'Gestión de sprints y backlog',
    },
    'veb5apvv': {
      'pt': 'Aplicativo mobile para tarefas',
      'en': 'Mobile app for tasks',
      'es': 'Aplicación móvil para tareas',
    },
    '1dah3d80': {
      'pt': 'Cadastro ilimitado de funcionários',
      'en': 'Unlimited employee registration',
      'es': 'Registro ilimitado de empleados',
    },
    'k4ku2ffj': {
      'pt': 'Controle completo de estoque',
      'en': 'Complete inventory control',
      'es': 'Control completo de inventario',
    },
    'uafnvg2l': {
      'pt': 'Relatórios avançados',
      'en': 'Advanced reports',
      'es': 'Informes avanzados',
    },
    'r3bvh0vb': {
      'pt': 'Começar Agora',
      'en': 'Start Now',
      'es': 'Empieza ahora',
    },
    '3bdacn1o': {
      'pt': 'Profissional',
      'en': 'Professional',
      'es': 'Profesional',
    },
    'kd8ctxd5': {
      'pt': 'Para fazendas solares completas',
      'en': 'For complete solar farms',
      'es': 'Para parques solares completos',
    },
    '19kw1s2w': {
      'pt': 'R\$ 399',
      'en': 'R\$ 399',
      'es': '399 reales',
    },
    '0479b4fo': {
      'pt': '/mês',
      'en': '/month',
      'es': '/mes',
    },
    'lgnp94k8': {
      'pt': 'Hello World',
      'en': 'Hello World',
      'es': 'Hola Mundo',
    },
    '4cky9aj7': {
      'pt': 'Consultas ilimitadas à IA',
      'en': 'Unlimited AI queries',
      'es': 'Consultas de IA ilimitadas',
    },
    'gxjegpo1': {
      'pt': 'Projetos ilimitados',
      'en': 'Unlimited projects',
      'es': 'Proyectos ilimitados',
    },
    't8ta1f6a': {
      'pt': 'Mapa de trackers avançado',
      'en': 'Advanced tracker map',
      'es': 'Mapa de seguimiento avanzado',
    },
    '606efdmb': {
      'pt': 'Gestão de sprints e backlog',
      'en': 'Sprint and backlog management',
      'es': 'Gestión de sprints y backlog',
    },
    'g6vr01rr': {
      'pt': 'Aplicativo mobile para tarefas',
      'en': 'Mobile app for tasks',
      'es': 'Aplicación móvil para tareas',
    },
    'e7qs9li7': {
      'pt': 'Cadastro ilimitado de funcionários',
      'en': 'Unlimited employee registration',
      'es': 'Registro ilimitado de empleados',
    },
    'xrcnbgpc': {
      'pt': 'Controle completo de estoque',
      'en': 'Complete inventory control',
      'es': 'Control completo de inventario',
    },
    'zoyfcrce': {
      'pt': 'Relatórios avançados',
      'en': 'Advanced reports',
      'es': 'Informes avanzados',
    },
    'clhxlvht': {
      'pt': 'Começar Agora',
      'en': 'Start Now',
      'es': 'Empieza ahora',
    },
    'j49hxp8g': {
      'pt': 'Home',
      'en': 'Home',
      'es': 'Hogar',
    },
  },
  // mapa_tracker_web
  {
    'h6h7mehi': {
      'pt': 'Projetos',
      'en': 'Projects',
      'es': 'Proyectos',
    },
    'f194gasd': {
      'pt': 'Mapa de trackers',
      'en': 'Tracker map',
      'es': 'Mapa de seguimiento',
    },
    '4oxyyslm': {
      'pt': 'Home',
      'en': 'Home',
      'es': 'Hogar',
    },
  },
  // Empresa
  {
    'wwwohqb2': {
      'pt': 'Sair do sistema',
      'en': 'Exit the system',
      'es': 'Salir del sistema',
    },
    'qgeu5w3p': {
      'pt': 'Olá, ',
      'en': 'Hello,',
      'es': 'Hola,',
    },
    '9o6hoy2z': {
      'pt': 'Cadastro da empresa',
      'en': 'Company registration',
      'es': 'Registro de empresa',
    },
    'zlsomx5t': {
      'pt': 'Finalize o cadastro da Empresa para ter acesso ao sistema',
      'en': 'Complete the company registration to gain access to the system.',
      'es':
          'Complete el registro de la empresa para obtener acceso al sistema.',
    },
    'zvsmhiya': {
      'pt':
          'Preencha todos os dados da empresa a baixo para poder acessar a plataforma.',
      'en':
          'Please fill in all the company details below to access the platform.',
      'es':
          'Por favor, rellene todos los datos de la empresa a continuación para acceder a la plataforma.',
    },
    'sbeqbae5': {
      'pt': 'Nome Fantasia',
      'en': 'Trade Name',
      'es': 'Nombre comercial',
    },
    '8e44bv9o': {
      'pt': '',
      'en': '',
      'es': '',
    },
    'ogg6drgu': {
      'pt': 'Ex: IndustriView',
      'en': 'Example: IndustriView',
      'es': 'Ejemplo: IndustriView',
    },
    '1q1nu3jg': {
      'pt': 'Razão Social',
      'en': 'Company Name',
      'es': 'nombre de empresa',
    },
    'v6ggtm5s': {
      'pt': '',
      'en': '',
      'es': '',
    },
    'gkvupk3u': {
      'pt': 'Ex: IndustriView',
      'en': 'Example: IndustriView',
      'es': 'Ejemplo: IndustriView',
    },
    'il99izzi': {
      'pt': 'CNPJ',
      'en': 'CNPJ',
      'es': 'CNPJ',
    },
    '5e1powgt': {
      'pt': '',
      'en': '',
      'es': '',
    },
    '6u21wgnt': {
      'pt': '12.345.678/9101-23',
      'en': '12.345.678/9101-23',
      'es': '12.345.678/9101-23',
    },
    'ddypuuaq': {
      'pt': 'Telefone da Empresa',
      'en': 'Company Phone Number',
      'es': 'Número de teléfono de la empresa',
    },
    'qxzj77oe': {
      'pt': '',
      'en': '',
      'es': '',
    },
    'fe3uvmdv': {
      'pt': '(12) 3 4567-8910',
      'en': '(12) 3 4567-8910',
      'es': '(12) 3 4567-8910',
    },
    'hgvillwb': {
      'pt': 'Email da Empresa',
      'en': 'Company Email',
      'es': 'Correo electrónico de la empresa',
    },
    'yosnv344': {
      'pt': '',
      'en': '',
      'es': '',
    },
    'fhgrcp4p': {
      'pt': 'seu@email.com',
      'en': 'your@email.com',
      'es': 'tu@correoelectrónico.com',
    },
    'zi1n1ewv': {
      'pt': 'CEP',
      'en': 'ZIP code',
      'es': 'Código postal',
    },
    'qfh4lgel': {
      'pt': '',
      'en': '',
      'es': '',
    },
    '5x6duaa2': {
      'pt': 'Ex: 12345-678',
      'en': 'Ex: 12345-678',
      'es': 'Ej: 12345-678',
    },
    'mm1e5hjn': {
      'pt': 'Número',
      'en': 'Number',
      'es': 'Número',
    },
    'yrzbti9o': {
      'pt': '',
      'en': '',
      'es': '',
    },
    '4zxqtxx5': {
      'pt': 'Ex: 88',
      'en': 'Ex: 88',
      'es': 'Ej: 88',
    },
    '5ro9wavl': {
      'pt': 'Logradouro',
      'en': 'Street',
      'es': 'Calle',
    },
    '1y9pqen3': {
      'pt': '',
      'en': '',
      'es': '',
    },
    's5x7iwpf': {
      'pt': 'Ex: Avenida Paulista',
      'en': 'Example: Paulista Avenue',
      'es': 'Ejemplo: Avenida Paulista',
    },
    'ily55c4f': {
      'pt': 'Cidade',
      'en': 'City',
      'es': 'Ciudad',
    },
    '79ipv026': {
      'pt': '',
      'en': '',
      'es': '',
    },
    'wrqugvtm': {
      'pt': 'Ex: São paulo',
      'en': 'Example: São Paulo',
      'es': 'Ejemplo: São Paulo',
    },
    '2s5jaezp': {
      'pt': 'UF',
      'en': 'UF',
      'es': 'UF',
    },
    'n742bk7r': {
      'pt': '',
      'en': '',
      'es': '',
    },
    'k2t78uj3': {
      'pt': 'Ex: SP',
      'en': 'Ex: SP',
      'es': 'Ej: SP',
    },
    'qx963qdb': {
      'pt': 'Complemento',
      'en': 'Supplement',
      'es': 'Suplemento',
    },
    'ionlabds': {
      'pt': '',
      'en': '',
      'es': '',
    },
    '7or73brm': {
      'pt': 'Ex: Prédio de Esquida',
      'en': 'Example: Corner Building',
      'es': 'Ejemplo: Edificio de esquina',
    },
    'fzcq8h80': {
      'pt': 'Cadastrar Empresa',
      'en': 'Register Company',
      'es': 'Registrar empresa',
    },
    'txrvhc1t': {
      'pt': 'Erro',
      'en': 'Error',
      'es': 'Error',
    },
    'dyild28s': {
      'pt': '* Campo é obrigatório.',
      'en': '* This field is required.',
      'es': '* Este campo es obligatorio.',
    },
    'kbd1c5re': {
      'pt': 'Please choose an option from the dropdown',
      'en': 'Please choose an option from the dropdown',
      'es': 'Por favor, elija una opción del menú desplegable.',
    },
    'zmdfoaxd': {
      'pt': '* Campo é obrigatório.',
      'en': '* This field is required.',
      'es': '* Este campo es obligatorio.',
    },
    'qwxq40od': {
      'pt': 'Please choose an option from the dropdown',
      'en': 'Please choose an option from the dropdown',
      'es': 'Por favor, elija una opción del menú desplegable.',
    },
    '3dcysjdf': {
      'pt': '* Campo é obrigatório.',
      'en': '* This field is required.',
      'es': '* Este campo es obligatorio.',
    },
    'ftbo1905': {
      'pt': 'Please choose an option from the dropdown',
      'en': 'Please choose an option from the dropdown',
      'es': 'Por favor, elija una opción del menú desplegable.',
    },
    'qd4lrc7i': {
      'pt': '* Campo é obrigatório.',
      'en': '* This field is required.',
      'es': '* Este campo es obligatorio.',
    },
    'qq1vp1zc': {
      'pt': 'Please choose an option from the dropdown',
      'en': 'Please choose an option from the dropdown',
      'es': 'Por favor, elija una opción del menú desplegable.',
    },
    '6xvayywf': {
      'pt': '* Campo é obrigatório.',
      'en': '* This field is required.',
      'es': '* Este campo es obligatorio.',
    },
    'bbmpbxgh': {
      'pt': 'Digite um email valido.',
      'en': 'Enter a valid email address.',
      'es': 'Introduzca una dirección de correo electrónico válida.',
    },
    'sd83q9os': {
      'pt': 'Please choose an option from the dropdown',
      'en': 'Please choose an option from the dropdown',
      'es': 'Por favor, elija una opción del menú desplegable.',
    },
    '2ok9xs8h': {
      'pt': '* Campo é obrigatório.',
      'en': '* This field is required.',
      'es': '* Este campo es obligatorio.',
    },
    'xuvtj5ch': {
      'pt': 'Please choose an option from the dropdown',
      'en': 'Please choose an option from the dropdown',
      'es': 'Por favor, elija una opción del menú desplegable.',
    },
    'eb0wk4u8': {
      'pt': '* Campo é obrigatório.',
      'en': '* This field is required.',
      'es': '* Este campo es obligatorio.',
    },
    '3yvhtnpk': {
      'pt': 'Please choose an option from the dropdown',
      'en': 'Please choose an option from the dropdown',
      'es': 'Por favor, elija una opción del menú desplegable.',
    },
    '25np0hdg': {
      'pt': '* Campo é obrigatório.',
      'en': '* This field is required.',
      'es': '* Este campo es obligatorio.',
    },
    '2vt0pnjw': {
      'pt': 'Please choose an option from the dropdown',
      'en': 'Please choose an option from the dropdown',
      'es': 'Por favor, elija una opción del menú desplegable.',
    },
    'cta1fvp8': {
      'pt': '* Campo é obrigatório.',
      'en': '* This field is required.',
      'es': '* Este campo es obligatorio.',
    },
    'o6o0pbf4': {
      'pt': 'Please choose an option from the dropdown',
      'en': 'Please choose an option from the dropdown',
      'es': 'Por favor, elija una opción del menú desplegable.',
    },
    '0phbpyxj': {
      'pt': '* Campo é obrigatório.',
      'en': '* This field is required.',
      'es': '* Este campo es obligatorio.',
    },
    'hnp90pt5': {
      'pt': 'Please choose an option from the dropdown',
      'en': 'Please choose an option from the dropdown',
      'es': 'Por favor, elija una opción del menú desplegable.',
    },
    'cv3je5tr': {
      'pt': 'Ex: Predio de Esquida is required',
      'en': 'Ex: Predio de Esquida is required',
      'es': 'Ej: Se requiere Predio de Esquida',
    },
    'je6crpxr': {
      'pt': 'Please choose an option from the dropdown',
      'en': 'Please choose an option from the dropdown',
      'es': 'Por favor, elija una opción del menú desplegable.',
    },
    'd3wz3iwh': {
      'pt': 'Home',
      'en': 'Home',
      'es': 'Hogar',
    },
  },
  // GerenciamentodaConta
  {
    '05umhe9i': {
      'pt': 'Gerenciamento da Conta',
      'en': 'Account Management',
      'es': 'Gestión de cuentas',
    },
    'p7zqxyb6': {
      'pt':
          'Nesta área você pode gerenciar suas informações pessoais, os dados da empresa e os detalhes do plano contratado. Atualize perfis, configure preferências e acompanhe sua assinatura de forma simples e centralizada.',
      'en':
          'In this area you can manage your personal information, company data, and plan details. Update profiles, configure preferences, and track your subscription in a simple and centralized way.',
      'es':
          'En esta área puedes gestionar tu información personal, los datos de tu empresa y los detalles de tu plan. Actualiza perfiles, configura preferencias y haz seguimiento de tu suscripción de forma sencilla y centralizada.',
    },
    '2ehfu78l': {
      'pt': 'Meu Perfil',
      'en': 'My Profile',
      'es': 'Mi perfil',
    },
    'bihwo6wp': {
      'pt': 'Meu Perfil',
      'en': 'My Profile',
      'es': 'Mi perfil',
    },
    'ziew1zb7': {
      'pt': 'Nome',
      'en': 'Name',
      'es': 'Nombre',
    },
    'w2s2tszm': {
      'pt': '',
      'en': '',
      'es': '',
    },
    'wkc419ej': {
      'pt': 'João Silva',
      'en': 'John Silva',
      'es': 'Juan Silva',
    },
    'v9o7hvd9': {
      'pt': 'Telefone',
      'en': 'Telephone',
      'es': 'Teléfono',
    },
    'kfp3coxc': {
      'pt': '',
      'en': '',
      'es': '',
    },
    '8sdxu3f6': {
      'pt': '(12) 3 4567-8912',
      'en': '(12) 3 4567-8912',
      'es': '(12) 3 4567-8912',
    },
    'ebpr7pwl': {
      'pt': 'Email',
      'en': 'E-mail',
      'es': 'Correo electrónico',
    },
    '3g0jpzlt': {
      'pt': '',
      'en': '',
      'es': '',
    },
    'fam4rn9h': {
      'pt': 'seu@email.com',
      'en': 'your@email.com',
      'es': 'tu@correoelectrónico.com',
    },
    '5a548c3v': {
      'pt': 'Trocar senha',
      'en': 'Change password',
      'es': 'Cambiar la contraseña',
    },
    '6w88wspx': {
      'pt': 'Senha',
      'en': 'Password',
      'es': 'Contraseña',
    },
    'qolm48hg': {
      'pt': '',
      'en': '',
      'es': '',
    },
    '5eq5du7r': {
      'pt': '***********************',
      'en': '***********************',
      'es': '***********************',
    },
    '03cn4q23': {
      'pt': 'Sua senha está',
      'en': 'Your password is',
      'es': 'Tu contraseña es',
    },
    'tqtp1wl4': {
      'pt': 'fraca',
      'en': 'weak',
      'es': 'débil',
    },
    'iwysizwe': {
      'pt': 'média',
      'en': 'average',
      'es': 'promedio',
    },
    'zzyllypo': {
      'pt': 'forte',
      'en': 'strong',
      'es': 'fuerte',
    },
    'x8lsoa0m': {
      'pt': 'muito forte',
      'en': 'very strong',
      'es': 'acérrimo',
    },
    'ncrd96y9': {
      'pt': 'Confirmar senha',
      'en': 'Confirm password',
      'es': 'Confirmar Contraseña',
    },
    'dsk1d8p0': {
      'pt': '',
      'en': '',
      'es': '',
    },
    'i55zu89q': {
      'pt': '***********************',
      'en': '***********************',
      'es': '***********************',
    },
    '9nfndg75': {
      'pt': 'As senhas não coincidem.',
      'en': 'The passwords don\'t match.',
      'es': 'Las contraseñas no coinciden.',
    },
    '117goi6i': {
      'pt': 'Atualizar Usuário',
      'en': 'Update User',
      'es': 'Actualizar usuario',
    },
    'gaxfq4uj': {
      'pt': '* Campo obrigatório',
      'en': '* Required field',
      'es': '* Campo obligatorio',
    },
    'o8e9g39a': {
      'pt': 'Please choose an option from the dropdown',
      'en': 'Please choose an option from the dropdown',
      'es': 'Por favor, elija una opción del menú desplegable.',
    },
    'u38wfd36': {
      'pt': '* Campo obrigatório',
      'en': '* Required field',
      'es': '* Campo obligatorio',
    },
    'pv1p0snr': {
      'pt': 'Please choose an option from the dropdown',
      'en': 'Please choose an option from the dropdown',
      'es': 'Por favor, elija una opción del menú desplegable.',
    },
    'wygqed55': {
      'pt': '* Campo obrigatório',
      'en': '* Required field',
      'es': '* Campo obligatorio',
    },
    '9dmwm23s': {
      'pt': 'Please choose an option from the dropdown',
      'en': 'Please choose an option from the dropdown',
      'es': 'Por favor, elija una opción del menú desplegable.',
    },
    'vz7c8y8z': {
      'pt': '*********************** is required',
      'en': '*********************** is required',
      'es': '*********************** se requiere',
    },
    'tt8mls9z': {
      'pt': 'Please choose an option from the dropdown',
      'en': 'Please choose an option from the dropdown',
      'es': 'Por favor, elija una opción del menú desplegable.',
    },
    'urfzxw63': {
      'pt': '*********************** is required',
      'en': '*********************** is required',
      'es': '*********************** se requiere',
    },
    '16nto7m4': {
      'pt': 'Please choose an option from the dropdown',
      'en': 'Please choose an option from the dropdown',
      'es': 'Por favor, elija una opción del menú desplegable.',
    },
    'sziusz7k': {
      'pt': 'Empresa',
      'en': 'Enterprise',
      'es': 'Empresa',
    },
    'letbzkb9': {
      'pt': 'Dados da Empresa',
      'en': 'Company Data',
      'es': 'Datos de la empresa',
    },
    '1zicqtm7': {
      'pt': 'Nome Fantasia',
      'en': 'Trade Name',
      'es': 'Nombre comercial',
    },
    'spdmgaot': {
      'pt': '',
      'en': '',
      'es': '',
    },
    'in6qqg27': {
      'pt': 'Ex: IndustriView',
      'en': 'Example: IndustriView',
      'es': 'Ejemplo: IndustriView',
    },
    'ufl7cpkb': {
      'pt': 'Razão Social',
      'en': 'Company Name',
      'es': 'nombre de empresa',
    },
    'tojwak4w': {
      'pt': '',
      'en': '',
      'es': '',
    },
    'htg7s72z': {
      'pt': 'Ex: IndustriView',
      'en': 'Example: IndustriView',
      'es': 'Ejemplo: IndustriView',
    },
    'hbpjjnsf': {
      'pt': 'CNPJ',
      'en': 'CNPJ',
      'es': 'CNPJ',
    },
    'ugyq5v34': {
      'pt': '',
      'en': '',
      'es': '',
    },
    '7y5rvf3n': {
      'pt': '12.345.678/9101-23',
      'en': '12.345.678/9101-23',
      'es': '12.345.678/9101-23',
    },
    'kiab5030': {
      'pt': 'Telefone da Empresa',
      'en': 'Company Phone Number',
      'es': 'Número de teléfono de la empresa',
    },
    'k9rzgllh': {
      'pt': '',
      'en': '',
      'es': '',
    },
    'q8bw9d86': {
      'pt': '(12) 3 4567-8910',
      'en': '(12) 3 4567-8910',
      'es': '(12) 3 4567-8910',
    },
    'i0b4xnuq': {
      'pt': 'Email da Empresa',
      'en': 'Company Email',
      'es': 'Correo electrónico de la empresa',
    },
    '9urs2e6n': {
      'pt': '',
      'en': '',
      'es': '',
    },
    '7zr5dt9h': {
      'pt': 'seu@email.com',
      'en': 'your@email.com',
      'es': 'tu@correoelectrónico.com',
    },
    'uvjzbx3g': {
      'pt': 'CEP',
      'en': 'ZIP code',
      'es': 'Código postal',
    },
    'afkn8oy5': {
      'pt': '',
      'en': '',
      'es': '',
    },
    'k2339kqi': {
      'pt': 'Ex: 12345-678',
      'en': 'Ex: 12345-678',
      'es': 'Ej: 12345-678',
    },
    'j7w5n738': {
      'pt': 'Número',
      'en': 'Number',
      'es': 'Número',
    },
    'g4ov6jj6': {
      'pt': '',
      'en': '',
      'es': '',
    },
    'd1fck225': {
      'pt': 'Ex: 88',
      'en': 'Ex: 88',
      'es': 'Ej: 88',
    },
    '1p4ka00y': {
      'pt': 'Logradouro',
      'en': 'Street',
      'es': 'Calle',
    },
    '5dcobxj9': {
      'pt': '',
      'en': '',
      'es': '',
    },
    '9eet983b': {
      'pt': 'Ex: Avenida Paulista',
      'en': 'Example: Paulista Avenue',
      'es': 'Ejemplo: Avenida Paulista',
    },
    'qvssp4u5': {
      'pt': 'Cidade',
      'en': 'City',
      'es': 'Ciudad',
    },
    'naoeo3zy': {
      'pt': '',
      'en': '',
      'es': '',
    },
    'jjj8pujv': {
      'pt': 'Ex: São paulo',
      'en': 'Example: São Paulo',
      'es': 'Ejemplo: São Paulo',
    },
    'addgoeib': {
      'pt': 'UF',
      'en': 'UF',
      'es': 'UF',
    },
    'lork6cee': {
      'pt': '',
      'en': '',
      'es': '',
    },
    'io9boff5': {
      'pt': 'Ex: SP',
      'en': 'Ex: SP',
      'es': 'Ej: SP',
    },
    '5tiakqpc': {
      'pt': 'Complemento',
      'en': 'Supplement',
      'es': 'Suplemento',
    },
    'zzeigiuv': {
      'pt': '',
      'en': '',
      'es': '',
    },
    'eap6lwaw': {
      'pt': 'Ex: Prédio de Esquida',
      'en': 'Example: Corner Building',
      'es': 'Ejemplo: Edificio de esquina',
    },
    'ccxvql33': {
      'pt': 'Atualizar Empresa',
      'en': 'Update Company',
      'es': 'Actualizar empresa',
    },
    '93qeqnd0': {
      'pt': 'Erro',
      'en': 'Error',
      'es': 'Error',
    },
    '3ol2hxcq': {
      'pt': '* Campo obrigatório',
      'en': '* Required field',
      'es': '* Campo obligatorio',
    },
    'peo5tanz': {
      'pt': 'Please choose an option from the dropdown',
      'en': 'Please choose an option from the dropdown',
      'es': 'Por favor, elija una opción del menú desplegable.',
    },
    'fyqea1zl': {
      'pt': '* Campo obrigatório',
      'en': '* Required field',
      'es': '* Campo obligatorio',
    },
    'sho26oj7': {
      'pt': 'Please choose an option from the dropdown',
      'en': 'Please choose an option from the dropdown',
      'es': 'Por favor, elija una opción del menú desplegable.',
    },
    '9f9i8urz': {
      'pt': '* Campo obrigatório',
      'en': '* Required field',
      'es': '* Campo obligatorio',
    },
    's00d2for': {
      'pt': 'Please choose an option from the dropdown',
      'en': 'Please choose an option from the dropdown',
      'es': 'Por favor, elija una opción del menú desplegable.',
    },
    'q9bdw03r': {
      'pt': '* Campo obrigatório',
      'en': '* Required field',
      'es': '* Campo obligatorio',
    },
    'a7vpkdme': {
      'pt': 'Please choose an option from the dropdown',
      'en': 'Please choose an option from the dropdown',
      'es': 'Por favor, elija una opción del menú desplegable.',
    },
    'ehwhzky0': {
      'pt': '* Campo obrigatório',
      'en': '* Required field',
      'es': '* Campo obligatorio',
    },
    '79km7gvo': {
      'pt': 'Please choose an option from the dropdown',
      'en': 'Please choose an option from the dropdown',
      'es': 'Por favor, elija una opción del menú desplegable.',
    },
    '6ak7g4zo': {
      'pt': '* Campo obrigatório',
      'en': '* Required field',
      'es': '* Campo obligatorio',
    },
    'iwppi6oc': {
      'pt': 'Please choose an option from the dropdown',
      'en': 'Please choose an option from the dropdown',
      'es': 'Por favor, elija una opción del menú desplegable.',
    },
    'tbngnc5u': {
      'pt': '* Campo obrigatório',
      'en': '* Required field',
      'es': '* Campo obligatorio',
    },
    'yznmudgs': {
      'pt': 'Please choose an option from the dropdown',
      'en': 'Please choose an option from the dropdown',
      'es': 'Por favor, elija una opción del menú desplegable.',
    },
    'ab5vd0mn': {
      'pt': '* Campo obrigatório',
      'en': '* Required field',
      'es': '* Campo obligatorio',
    },
    'e0ffxbew': {
      'pt': 'Please choose an option from the dropdown',
      'en': 'Please choose an option from the dropdown',
      'es': 'Por favor, elija una opción del menú desplegable.',
    },
    'q7fqm7tt': {
      'pt': '* Campo obrigatório',
      'en': '* Required field',
      'es': '* Campo obligatorio',
    },
    'vitg0i6s': {
      'pt': 'Please choose an option from the dropdown',
      'en': 'Please choose an option from the dropdown',
      'es': 'Por favor, elija una opción del menú desplegable.',
    },
    '2o0bpw5f': {
      'pt': '* Campo obrigatório',
      'en': '* Required field',
      'es': '* Campo obligatorio',
    },
    'g3dsm8on': {
      'pt': 'Please choose an option from the dropdown',
      'en': 'Please choose an option from the dropdown',
      'es': 'Por favor, elija una opción del menú desplegable.',
    },
    'opfzy9x7': {
      'pt': 'Ex: Prédio de Esquida is required',
      'en': 'Ex: Corner Building is required',
      'es': 'Ej: Se requiere edificio de esquina',
    },
    's2wgj3dk': {
      'pt': 'Please choose an option from the dropdown',
      'en': 'Please choose an option from the dropdown',
      'es': 'Por favor, elija una opción del menú desplegable.',
    },
    '6dp3b46x': {
      'pt': 'Planos',
      'en': 'Plans',
      'es': 'Planes',
    },
    'k7mn7jpm': {
      'pt': 'Meu Plano',
      'en': 'My Plan',
      'es': 'Mi plan',
    },
    '9cr7xgn8': {
      'pt': 'Plano Atual',
      'en': 'Current Plan',
      'es': 'Plan actual',
    },
    'qn5o6ho5': {
      'pt': 'Básico',
      'en': 'Basic',
      'es': 'Básico',
    },
    'c9hb6a6y': {
      'pt': 'R\$ 199',
      'en': '',
      'es': '',
    },
    'b7a6l35g': {
      'pt': ' / mês',
      'en': '',
      'es': '',
    },
    'my538d3t': {
      'pt': 'Hello World',
      'en': '',
      'es': '',
    },
    'eo060vp6': {
      'pt': 'Para começar explorar',
      'en': 'To begin exploring',
      'es': 'Para comenzar a explorar',
    },
    'rmc8hls2': {
      'pt': 'Ativo',
      'en': 'Active',
      'es': 'Activo',
    },
    'f7q0wwae': {
      'pt': 'Forma de pagamento atual:',
      'en': 'Current payment method:',
      'es': 'Método de pago actual:',
    },
    '5ax01kom': {
      'pt': 'Renovação automático',
      'en': 'Automatic renewal',
      'es': 'Renovación automática',
    },
    '317k2x7y': {
      'pt': 'Mudar de plano',
      'en': 'Change plans',
      'es': 'Cambiar planes',
    },
    'uzyuhmer': {
      'pt': 'Cancelar plano',
      'en': 'Cancel plan',
      'es': 'Cancelar plan',
    },
    '7hwazro5': {
      'pt': 'Uso do Plano',
      'en': 'Plan Usage',
      'es': 'Uso del plan',
    },
    's9r3icas': {
      'pt': 'Consulta á IA',
      'en': 'Consulting AI',
      'es': 'Consultoría de IA',
    },
    'yrprt2pi': {
      'pt': '75%',
      'en': '75%',
      'es': '75%',
    },
    'r93auawz': {
      'pt': 'Projetos',
      'en': 'Projects',
      'es': 'Proyectos',
    },
    'vd3punvf': {
      'pt': '3/5',
      'en': '3/5',
      'es': '3/5',
    },
    'ssxhja43': {
      'pt': 'Funcionários',
      'en': 'Employees',
      'es': 'Empleados',
    },
    'sb5dac29': {
      'pt': '7/10',
      'en': '7/10',
      'es': '7/10',
    },
    '17v4leac': {
      'pt': 'Módulo',
      'en': 'Module',
      'es': 'Módulo',
    },
    'ztr0qo0j': {
      'pt': '3/ilimitado',
      'en': '3/unlimited',
      'es': '3/ilimitado',
    },
    'g6uidv4p': {
      'pt': 'Tracker',
      'en': 'Tracker',
      'es': 'Rastreador',
    },
    'mvv3pu8j': {
      'pt': '5/ilimitado',
      'en': '5/unlimited',
      'es': '5/ilimitado',
    },
    'ma01kn54': {
      'pt': 'Gratuito',
      'en': 'Free',
      'es': 'Gratis',
    },
    '28fskzfg': {
      'pt': 'Para começar explorar',
      'en': 'To begin exploring',
      'es': 'Para comenzar a explorar',
    },
    'sjv5kjok': {
      'pt': 'R\$ 0',
      'en': 'R\$ 0',
      'es': '0 reales',
    },
    'pov9fb3t': {
      'pt': ' / mês',
      'en': ' / month',
      'es': ' / mes',
    },
    'grj5rreg': {
      'pt': 'Hello World',
      'en': '',
      'es': '',
    },
    'k95vepy1': {
      'pt': '100 consultas à IA por mês',
      'en': '100 AI queries per month',
      'es': '100 consultas de IA al mes',
    },
    'y5yxuci9': {
      'pt': '1 projeto',
      'en': '1 project',
      'es': '1 proyecto',
    },
    'u2ri4vin': {
      'pt': 'Até 3 tracker',
      'en': 'Up to 3 trackers',
      'es': 'Hasta 3 rastreadores',
    },
    'wix8t63t': {
      'pt': 'Até 3 módulos',
      'en': 'Up to 3 modules',
      'es': 'Hasta 3 módulos',
    },
    'tl0d9ouh': {
      'pt': 'Até 3 funcionários',
      'en': 'Up to 3 employees',
      'es': 'Hasta 3 empleados',
    },
    'dk657zei': {
      'pt': 'Sistema web básico',
      'en': 'Basic web system',
      'es': 'Sistema web básico',
    },
    '5szza3f5': {
      'pt': 'Mudar para plano gratuito',
      'en': 'Switch to free plan',
      'es': 'Cambiar al plan gratuito',
    },
    'wprp0gea': {
      'pt': 'Plano Atual',
      'en': 'Current Plan',
      'es': 'Plan actual',
    },
    'v6vqidf9': {
      'pt': 'Mais popular',
      'en': 'Most popular',
      'es': 'Los más populares',
    },
    'bjisr0wi': {
      'pt': 'Básico',
      'en': 'Basic',
      'es': 'Básico',
    },
    'sviosbeo': {
      'pt': 'Ideal por pequenos projetos',
      'en': 'Ideal for small projects.',
      'es': 'Ideal para pequeños proyectos.',
    },
    'mxdznmec': {
      'pt': 'R\$ 199',
      'en': 'R\$ 199',
      'es': '199 reales',
    },
    'wsc4629s': {
      'pt': ' / mês',
      'en': ' / month',
      'es': ' / mes',
    },
    'fqz4kewv': {
      'pt': 'Hello World',
      'en': '',
      'es': '',
    },
    'm0pmd8sd': {
      'pt': '1.000 consultas à IA por mês',
      'en': '1,000 AI queries per month',
      'es': '1.000 consultas de IA al mes',
    },
    'rd3zs9yg': {
      'pt': 'Gestão de até 5 projetos',
      'en': 'Management of up to 5 projects',
      'es': 'Gestión de hasta 5 proyectos',
    },
    'hgy6g3pt': {
      'pt': 'Cadastro de trackers e módulos',
      'en': 'Registration of trackers and modules',
      'es': 'Registro de rastreadores y módulos',
    },
    'sirkejhz': {
      'pt': 'Controle de estoque básico',
      'en': 'Basic inventory control',
      'es': 'Control básico de inventario',
    },
    'y9gncemw': {
      'pt': 'Até 10 funcionários',
      'en': 'Up to 10 employees',
      'es': 'Hasta 10 empleados',
    },
    'o14sj6wk': {
      'pt': 'Sistema web completo',
      'en': 'Complete web-based system',
      'es': 'Sistema completo basado en web',
    },
    'volcwyf0': {
      'pt': 'Mudar para plano básico',
      'en': 'Switch to basic plan',
      'es': 'Cambiar al plan básico',
    },
    'pg0l8u93': {
      'pt': 'Plano Atual',
      'en': 'Current Plan',
      'es': 'Plan actual',
    },
    '6cztdk6m': {
      'pt': 'Profissional',
      'en': 'Professional',
      'es': 'Profesional',
    },
    'egi1em5j': {
      'pt': 'Para fazendas solares completas',
      'en': 'For complete solar farms',
      'es': 'Para parques solares completos',
    },
    'dl8he13y': {
      'pt': 'R\$ 399',
      'en': 'R\$ 399',
      'es': '399 reales',
    },
    'vxznpb6u': {
      'pt': ' / mês',
      'en': ' / month',
      'es': ' / mes',
    },
    '9cegn93f': {
      'pt': 'Hello World',
      'en': '',
      'es': '',
    },
    'msqkwk5t': {
      'pt': 'Consultas ilimitadas à IA',
      'en': 'Unlimited AI queries',
      'es': 'Consultas de IA ilimitadas',
    },
    '1fzm055v': {
      'pt': 'Projetos ilimitados',
      'en': 'Unlimited projects',
      'es': 'Proyectos ilimitados',
    },
    'jx4avl8b': {
      'pt': 'Mapa de trackers avançado',
      'en': 'Advanced tracker map',
      'es': 'Mapa de seguimiento avanzado',
    },
    'jfv2fo4p': {
      'pt': 'Gestão de sprints e backlog',
      'en': 'Sprint and backlog management',
      'es': 'Gestión de sprints y backlog',
    },
    'bvliv2ar': {
      'pt': 'Aplicativo mobile para tarefas',
      'en': 'Mobile app for tasks',
      'es': 'Aplicación móvil para tareas',
    },
    'xiul2w0d': {
      'pt': 'Cadastro ilimitado de funcionários',
      'en': 'Unlimited employee registration',
      'es': 'Registro ilimitado de empleados',
    },
    '8i9ve7hs': {
      'pt': 'Controle completo de estoque',
      'en': 'Complete inventory control',
      'es': 'Control completo de inventario',
    },
    '1hf3ly7s': {
      'pt': 'Relatórios avançados',
      'en': 'Advanced reports',
      'es': 'Informes avanzados',
    },
    'ttbqqpyg': {
      'pt': 'Mudar para plano profissional',
      'en': 'Switch to professional plan',
      'es': 'Cambiar al plan profesional',
    },
    'uywgggdn': {
      'pt': 'Plano Atual',
      'en': 'Current Plan',
      'es': 'Plan actual',
    },
    'houjt14r': {
      'pt': 'Home',
      'en': 'Home',
      'es': 'Hogar',
    },
  },
  // expiredplan
  {
    'pmukfs00': {
      'pt': 'Pagamento Pendente',
      'en': 'Payment Pending',
      'es': 'Pago pendiente',
    },
    'hh6aejs8': {
      'pt': 'Seu pagamento ainda não foi identificado.',
      'en': 'Your payment has not yet been identified.',
      'es': 'Su pago aún no ha sido identificado',
    },
    'xp7px6us': {
      'pt':
          'Para continuar utilizando todos os recursos do seu plano sem interrupções, é necessario concluir o pagamento.',
      'en':
          'To continue using all the features of your plan without interruption, you need to complete the payment.',
      'es':
          'Para continuar utilizando todas las funcionalidades de tu plan sin interrupciones, debes completar el pago.',
    },
    '8almeo50': {
      'pt': 'Detalhe do pagamento',
      'en': 'Payment details',
      'es': 'Detalles del pago',
    },
    'g1usf4rv': {
      'pt': 'Plano: ',
      'en': 'Flat: ',
      'es': 'Departamento: ',
    },
    'g8w464ss': {
      'pt': 'Plano Premium',
      'en': 'Premium Plan',
      'es': 'Plan Premium',
    },
    '9b9o80wx': {
      'pt': 'Detalhe do pagamento',
      'en': '',
      'es': '',
    },
    'eaoqb3x9': {
      'pt': 'Detalhe do pagamento',
      'en': 'Payment details',
      'es': 'Detalles del pago',
    },
    'ud4aqt6b': {
      'pt': 'Status: ',
      'en': 'Status: ',
      'es': 'Estado: ',
    },
    'mgm68csh': {
      'pt': 'Aguardando',
      'en': 'Waiting',
      'es': 'Espera',
    },
    '5df7l44a': {
      'pt': 'Detalhe do pagamento',
      'en': '',
      'es': '',
    },
    'ggs7xnfq': {
      'pt': 'pagamento',
      'en': 'payment',
      'es': 'pago',
    },
    'uu7zz5az': {
      'pt': 'O que acontece se o pagamento não for realizado?',
      'en': 'What happens if payment is not made?',
      'es': '¿Qué pasa si no se realiza el pago?',
    },
    '7jzf6xlb': {
      'pt': 'Seu acesso poderá ser ',
      'en': 'Your access may be',
      'es': 'Su acceso puede ser',
    },
    '4olp73my': {
      'pt': 'temporariamente limitado',
      'en': '',
      'es': '',
    },
    'rfll8bxt': {
      'pt': 'Seu acesso poderá ser temporariamente limitado',
      'en': '',
      'es': '',
    },
    'cg0t54md': {
      'pt': 'Alguns recursos do plano podem ficar ',
      'en': 'Some plan features may be ',
      'es': 'Algunas características del plan pueden ser ',
    },
    'bl3vrph7': {
      'pt': 'indisponiveis',
      'en': 'unavailable',
      'es': 'indisponible',
    },
    'elvsbw8q': {
      'pt': 'Seu acesso poderá ser temporariamente limitado',
      'en': '',
      'es': '',
    },
    '4c36jeod': {
      'pt': 'O que acesso completo será ',
      'en': 'What full access will be ',
      'es': '¿Qué será el acceso completo? ',
    },
    'gqz8yvzf': {
      'pt': 'restaurado automaticamente ',
      'en': 'restored automatically',
      'es': 'restaurado automáticamente',
    },
    'bbofpycq': {
      'pt': 'Seu acesso poderá ser temporariamente limitado',
      'en': '',
      'es': '',
    },
    'p8nvjvh7': {
      'pt': 'após a confirmação do pagamento',
      'en': 'after payment confirmation',
      'es': 'después de la confirmación del pago',
    },
    '4bl9k7kh': {
      'pt': 'Como regularizar',
      'en': 'How to regularize',
      'es': 'Cómo regularizar',
    },
    'd877i3nu': {
      'pt': '1',
      'en': '1',
      'es': '1',
    },
    '4rfltbju': {
      'pt': 'Clique no botão \"',
      'en': 'Click the button \"',
      'es': 'Haga clic en el botón \"',
    },
    'f9v1lqhb': {
      'pt': 'Pagar agora',
      'en': 'Pay now',
      'es': 'Pagar ahora',
    },
    'zxoxzhlm': {
      'pt': '\"',
      'en': '\"',
      'es': '\"',
    },
    'ln90topf': {
      'pt': 'Clique no botão \"',
      'en': '',
      'es': '',
    },
    '4tz3k03d': {
      'pt': '2',
      'en': '2',
      'es': '2',
    },
    'zeagyuva': {
      'pt': 'Finalize o pagamento e aguarde a confirmação',
      'en': 'Complete the payment and wait for confirmation.',
      'es': 'Complete el pago y espere la confirmación.',
    },
    '0isth3wy': {
      'pt': 'Pagar Agora',
      'en': 'Pay Now',
      'es': 'Pagar ahora',
    },
    'oss45yxi': {
      'pt': 'Precisa de ajuda?',
      'en': 'Need help?',
      'es': '¿Necesitar ayuda?',
    },
    'qes5ir3y': {
      'pt': 'Se você já realizou o ',
      'en': 'If you have already completed the ',
      'es': 'Si ya has completado el ',
    },
    '250mlte7': {
      'pt': 'pagamento ',
      'en': 'payment ',
      'es': 'pago ',
    },
    '7br3efod': {
      'pt':
          'ou está com alguma dificuldade, entre em contato com nosso suporte. Estamos aqui para ajudar 😊',
      'en':
          'If you\'re having any difficulties, please contact our support team. We\'re here to help 😊',
      'es':
          'Si tienes alguna dificultad, contacta con nuestro equipo de soporte. Estamos aquí para ayudarte.',
    },
    '2b2o7lj5': {
      'pt': 'Clique no botão \"',
      'en': '',
      'es': '',
    },
    'fia5pmm1': {
      'pt': 'Home',
      'en': 'Home',
      'es': 'Hogar',
    },
  },
  // import_task
  {
    '46468yyb': {
      'pt': 'Projetos',
      'en': 'Projects',
      'es': 'Proyectos',
    },
    '2gzenfc4': {
      'pt': 'Projetos Detalhes',
      'en': 'Project Details',
      'es': 'Detalles del proyecto',
    },
    'xxpdb3gt': {
      'pt': 'Backlog de tarefas',
      'en': 'Task backlog',
      'es': 'Atraso de tareas',
    },
    'o66cwy0w': {
      'pt': 'Importar tarefas',
      'en': 'Task backlog',
      'es': 'Atraso de tareas',
    },
    '42zv4es9': {
      'pt': 'Importar tarefas',
      'en': 'Import tasks',
      'es': 'Tareas de importación',
    },
    'nohijt1k': {
      'pt':
          'Importe tarefas a partir de um arquivo CSV, faça o DE/PARA dos campos e visualize a prévia antes de confirmar a importação.',
      'en':
          'Import tasks from a CSV file, map the fields to/from, and preview before confirming the import.',
      'es':
          'Importe tareas desde un archivo CSV, asigne los campos hacia/desde y obtenga una vista previa antes de confirmar la importación.',
    },
    'cz2vnsw1': {
      'pt': 'Importar CSV (.csv)',
      'en': 'Import CSV (.csv)',
      'es': 'Importar CSV (.csv)',
    },
    'o0ue2vmh': {
      'pt': 'Linhas Lidas: ',
      'en': 'Lines Read:',
      'es': 'Líneas leídas:',
    },
    'iayjqqfp': {
      'pt': 'Linhas Lidas: ',
      'en': '',
      'es': '',
    },
    '15bkofbp': {
      'pt': 'DE/PARA de colunas',
      'en': 'FROM/TO columns',
      'es': 'Columnas DESDE/HASTA',
    },
    't7517xlr': {
      'pt': 'Nome Tarefa',
      'en': 'Name',
      'es': 'Nombre',
    },
    'b52azhh4': {
      'pt': 'Data Inicio',
      'en': 'Start Date',
      'es': 'Fecha de inicio',
    },
    '8k04gory': {
      'pt': 'Data Fim',
      'en': 'End Date',
      'es': 'Fecha de finalización',
    },
    '8acdu0fe': {
      'pt': 'Responsavél',
      'en': 'Responsible',
      'es': 'Responsable',
    },
    'vdlnk477': {
      'pt': 'Prévia',
      'en': 'Import tasks',
      'es': 'Tareas de importación',
    },
    'n9b5zg25': {
      'pt': 'Prévia ',
      'en': 'Preview',
      'es': 'Avance',
    },
    'g0vvet2x': {
      'pt': 'Prévia ',
      'en': 'Projects',
      'es': 'Proyectos',
    },
    'cge3s656': {
      'pt': '#',
      'en': '#',
      'es': '#',
    },
    'a7r8awix': {
      'pt': 'Nome Tarefa',
      'en': 'Name',
      'es': 'Nombre',
    },
    'p3y4fu44': {
      'pt': 'Template',
      'en': 'Name',
      'es': 'Nombre',
    },
    '70g9q8vo': {
      'pt': 'Tarefa',
      'en': '',
      'es': '',
    },
    't73l3lj5': {
      'pt': ' (Comparação)',
      'en': '',
      'es': '',
    },
    'bgoy4k5m': {
      'pt': 'Data Inicio',
      'en': 'Start Date',
      'es': 'Fecha de inicio',
    },
    'f69gg7l6': {
      'pt': 'Responsável',
      'en': 'Responsible',
      'es': 'Responsable',
    },
    'w3gonkdw': {
      'pt': 'Responsável',
      'en': '',
      'es': '',
    },
    '4wnejbhk': {
      'pt': ' (Comparação)',
      'en': '',
      'es': '',
    },
    'jm6rejnd': {
      'pt': 'Data Inicio',
      'en': 'Start Date',
      'es': 'Fecha de inicio',
    },
    '7tpdl66z': {
      'pt': 'Importar tarefas',
      'en': 'Import tasks',
      'es': 'Tareas de importación',
    },
    'p2sf5cwk': {
      'pt': 'Limpar',
      'en': 'To clean',
      'es': 'Para limpiar',
    },
    'pxpz62op': {
      'pt': 'DE/PARA de colunas',
      'en': 'FROM/TO columns',
      'es': 'Columnas DESDE/HASTA',
    },
    'gat1r2it': {
      'pt': 'Nome',
      'en': 'Name',
      'es': 'Nombre',
    },
    'u0t4hmh5': {
      'pt': '',
      'en': '',
      'es': '',
    },
    'd7m5j6ng': {
      'pt': 'name',
      'en': 'name',
      'es': 'nombre',
    },
    '2ulrrko1': {
      'pt': 'Search...',
      'en': '',
      'es': '',
    },
    '1h7xtf6l': {
      'pt': 'name',
      'en': 'name',
      'es': 'nombre',
    },
    'f0prfh6o': {
      'pt': 'date_start',
      'en': 'start_date',
      'es': 'fecha de inicio',
    },
    't4cxgu65': {
      'pt': 'date_end',
      'en': 'date_end',
      'es': 'fecha_fin',
    },
    'pn5fz7ua': {
      'pt': 'responsible',
      'en': 'responsible',
      'es': 'responsable',
    },
    'fyo2x01a': {
      'pt': 'Data Inicio',
      'en': 'Start Date',
      'es': 'Fecha de inicio',
    },
    'bs4g6zpo': {
      'pt': '',
      'en': '',
      'es': '',
    },
    'e8jgtbir': {
      'pt': 'date_start',
      'en': 'name',
      'es': 'nombre',
    },
    'avnzfhec': {
      'pt': 'Search...',
      'en': '',
      'es': '',
    },
    'yt85n96m': {
      'pt': 'name',
      'en': 'name',
      'es': 'nombre',
    },
    'g0chxbbx': {
      'pt': 'date_start',
      'en': 'start_date',
      'es': 'fecha de inicio',
    },
    'fye6q976': {
      'pt': 'date_end',
      'en': 'date_end',
      'es': 'fecha_fin',
    },
    '2480kfdw': {
      'pt': 'responsible',
      'en': 'responsible',
      'es': 'responsable',
    },
    'bftgh0s1': {
      'pt': 'Data Fim',
      'en': 'End Date',
      'es': 'Fecha de finalización',
    },
    'rku9b5cj': {
      'pt': '',
      'en': '',
      'es': '',
    },
    'wspy49rq': {
      'pt': 'date_end',
      'en': 'name',
      'es': 'nombre',
    },
    'p1q114ei': {
      'pt': 'Search...',
      'en': '',
      'es': '',
    },
    'nvyly7zz': {
      'pt': 'name',
      'en': 'name',
      'es': 'nombre',
    },
    'zj6bqjnk': {
      'pt': 'date_start',
      'en': 'start_date',
      'es': 'fecha de inicio',
    },
    'ihleuvwv': {
      'pt': 'date_end',
      'en': 'date_end',
      'es': 'fecha_fin',
    },
    '78ojjx55': {
      'pt': 'responsible',
      'en': 'responsible',
      'es': 'responsable',
    },
    'o9a1gpe8': {
      'pt': 'Responsavél',
      'en': 'Responsible',
      'es': 'Responsable',
    },
    'r5llbar4': {
      'pt': '',
      'en': '',
      'es': '',
    },
    'zdm45efo': {
      'pt': 'responsible',
      'en': 'name',
      'es': 'nombre',
    },
    'rtfn76eu': {
      'pt': 'Search...',
      'en': '',
      'es': '',
    },
    'b6zfojf4': {
      'pt': 'name',
      'en': 'name',
      'es': 'nombre',
    },
    'q38g8hrp': {
      'pt': 'date_start',
      'en': 'start_date',
      'es': 'fecha de inicio',
    },
    'tievdhuk': {
      'pt': 'date_end',
      'en': 'date_end',
      'es': 'fecha_fin',
    },
    '95lodt43': {
      'pt': 'responsible',
      'en': 'responsible',
      'es': 'responsable',
    },
    '3c4nw38y': {
      'pt': 'Home',
      'en': 'Home',
      'es': 'Hogar',
    },
    'p6mp7m8j': {
      'pt': 'Erro',
      'en': 'Error',
      'es': 'Error',
    },
  },
  // modal_AddNovaSecao
  {
    '3hw6qozm': {
      'pt': 'Adicionar nova seção',
      'en': 'Add new section',
      'es': 'Añadir nueva sección',
    },
    'qweithgy': {
      'pt':
          'Ao adicionar uma nova seção, você também precisa configurar quantas fileiras vão ter',
      'en':
          'When adding a new section, you also need to configure how many rows it will have.',
      'es':
          'Al agregar una nueva sección, también debe configurar cuántas filas tendrá.',
    },
    'ttddafhh': {
      'pt': 'Criar nova seção',
      'en': 'Create new section',
      'es': 'Crear nueva sección',
    },
    '5q3e1867': {
      'pt': 'Erro',
      'en': 'Error',
      'es': 'Error',
    },
  },
  // options_modulos
  {
    'd3oenapm': {
      'pt': 'Editar módulo',
      'en': 'Edit module',
      'es': 'Editar módulo',
    },
    'vkgr0ab0': {
      'pt': 'Remover módulo',
      'en': 'Remove module',
      'es': 'Quitar módulo',
    },
    'u7n6sllp': {
      'pt': 'Erro!',
      'en': 'Error!',
      'es': '¡Error!',
    },
  },
  // modal_CadastrarEditarModulo
  {
    'l5tir766': {
      'pt': 'Preencha todas as informações para criar um novo módulo',
      'en': 'Fill in all the information to create a new module.',
      'es': 'Complete toda la información para crear un nuevo módulo.',
    },
    'gxf4sh8h': {
      'pt': 'Fabricante',
      'en': 'Manufacturer',
      'es': 'Fabricante',
    },
    'bxbi46tg': {
      'pt': '* Campo obrigatório',
      'en': '* Required field',
      'es': '* Campo obligatorio',
    },
    'g0ewiqdo': {
      'pt': 'Modelo de módulo',
      'en': 'Module model',
      'es': 'Modelo de módulo',
    },
    'nt6bbg4u': {
      'pt': '* Campo obrigatório',
      'en': '* Required field',
      'es': '* Campo obligatorio',
    },
    'gpxge8my': {
      'pt': 'Tensão',
      'en': 'Voltage',
      'es': 'Voltaje',
    },
    '91ng754c': {
      'pt': 'Digite aqui',
      'en': 'Type here',
      'es': 'Escribe aquí',
    },
    '23d4qysa': {
      'pt': 'Corrente',
      'en': 'Current',
      'es': 'Actual',
    },
    'fl9d0g2d': {
      'pt': 'Digite aqui',
      'en': 'Type here',
      'es': 'Escribe aquí',
    },
    '2ve7k44p': {
      'pt': 'Corrente de curto circuito',
      'en': 'Short circuit current',
      'es': 'Corriente de cortocircuito',
    },
    'dwpd0qlc': {
      'pt': 'Digite aqui',
      'en': 'Type here',
      'es': 'Escribe aquí',
    },
    'towaztvb': {
      'pt': 'Potência',
      'en': 'Power',
      'es': 'Fuerza',
    },
    'p3nakcwj': {
      'pt': 'Digite aqui',
      'en': 'Type here',
      'es': 'Escribe aquí',
    },
    '06azvfh0': {
      'pt': 'VCO',
      'en': 'VCO',
      'es': 'VCO',
    },
    'cbp2o6wx': {
      'pt': 'Digite aqui',
      'en': 'Type here',
      'es': 'Escribe aquí',
    },
    '6rlt371y': {
      'pt': 'IM',
      'en': 'IM',
      'es': 'SOY',
    },
    '2bffyiiy': {
      'pt': 'Digite aqui',
      'en': 'Type here',
      'es': 'Escribe aquí',
    },
    'ermpsa04': {
      'pt': 'VM',
      'en': 'VM',
      'es': 'Máquina virtual',
    },
    'pymzevtb': {
      'pt': 'Digite aqui',
      'en': 'Type here',
      'es': 'Escribe aquí',
    },
    'l0vz73my': {
      'pt': 'Salvar Módulo',
      'en': 'Save Module',
      'es': 'Módulo de guardado',
    },
    '40o7e25b': {
      'pt': 'Erro!',
      'en': 'Error!',
      'es': '¡Error!',
    },
    'ksv4g1og': {
      'pt': 'Erro!',
      'en': 'Error!',
      'es': '¡Error!',
    },
    '31s3rgqk': {
      'pt': '* Campo obrigatório',
      'en': '* Required field',
      'es': '* Campo obligatorio',
    },
    'ucxhftwe': {
      'pt': 'Please choose an option from the dropdown',
      'en': 'Please choose an option from the dropdown',
      'es': 'Por favor, elija una opción del menú desplegable.',
    },
    '20iyy1on': {
      'pt': '* Campo obrigatório',
      'en': '* Required field',
      'es': '* Campo obligatorio',
    },
    'inpftvo1': {
      'pt': 'Please choose an option from the dropdown',
      'en': 'Please choose an option from the dropdown',
      'es': 'Por favor, elija una opción del menú desplegable.',
    },
    'mqk5vqch': {
      'pt': '* Campo obrigatório',
      'en': '* Required field',
      'es': '* Campo obligatorio',
    },
    'rj3t7c3a': {
      'pt': 'Please choose an option from the dropdown',
      'en': 'Please choose an option from the dropdown',
      'es': 'Por favor, elija una opción del menú desplegable.',
    },
    '2w03r1d0': {
      'pt': '* Campo obrigatório',
      'en': '* Required field',
      'es': '* Campo obligatorio',
    },
    '49o7327r': {
      'pt': 'Please choose an option from the dropdown',
      'en': 'Please choose an option from the dropdown',
      'es': 'Por favor, elija una opción del menú desplegable.',
    },
    '0u41zhnd': {
      'pt': '* Campo obrigatório',
      'en': '* Required field',
      'es': '* Campo obligatorio',
    },
    'r6fgyvtl': {
      'pt': 'Please choose an option from the dropdown',
      'en': 'Please choose an option from the dropdown',
      'es': 'Por favor, elija una opción del menú desplegable.',
    },
    '7527uefo': {
      'pt': '* Campo obrigatório',
      'en': '* Required field',
      'es': '* Campo obligatorio',
    },
    'pnf3781u': {
      'pt': 'Please choose an option from the dropdown',
      'en': 'Please choose an option from the dropdown',
      'es': 'Por favor, elija una opción del menú desplegable.',
    },
    't3wvpdmh': {
      'pt': '* Campo obrigatório',
      'en': '* Required field',
      'es': '* Campo obligatorio',
    },
    'mt4bxt6e': {
      'pt': 'Please choose an option from the dropdown',
      'en': 'Please choose an option from the dropdown',
      'es': 'Por favor, elija una opción del menú desplegable.',
    },
  },
  // options_sprint
  {
    'lp6sqklo': {
      'pt': 'Ver Detalhes',
      'en': 'View Details',
      'es': 'Ver detalles',
    },
    '4cvdzfvw': {
      'pt': 'Editar sprint',
      'en': 'Edit sprint',
      'es': 'Editar sprint',
    },
    '85i7azzj': {
      'pt': 'Erro',
      'en': 'Error',
      'es': 'Error',
    },
  },
  // modal_UserAdmin
  {
    'nonudql1': {
      'pt': 'Meu Perfil',
      'en': 'My Profile',
      'es': 'Mi perfil',
    },
    'qgmmh7fl': {
      'pt':
          'Altere sua foto, nome, e-mail, telefone e senha para manter suas informações atualizadas e seguras.',
      'en':
          'Change your photo, name, email, phone number, and password to keep your information up-to-date and secure.',
      'es':
          'Cambie su foto, nombre, correo electrónico, número de teléfono y contraseña para mantener su información actualizada y segura.',
    },
    'ch9j1n51': {
      'pt': 'Nome',
      'en': 'Name',
      'es': 'Nombre',
    },
    '08owykbr': {
      'pt': '',
      'en': '',
      'es': '',
    },
    '205bmz4t': {
      'pt': 'João Silva',
      'en': 'John Silva',
      'es': 'Juan Silva',
    },
    'jpg1bh3l': {
      'pt': 'Telefone',
      'en': 'Telephone',
      'es': 'Teléfono',
    },
    'i2qsxf6i': {
      'pt': '',
      'en': '',
      'es': '',
    },
    'mfmw70nq': {
      'pt': '(12) 3 4567-8912',
      'en': '(12) 3 4567-8912',
      'es': '(12) 3 4567-8912',
    },
    '48axebfb': {
      'pt': 'Email',
      'en': 'E-mail',
      'es': 'Correo electrónico',
    },
    '0nbjoskq': {
      'pt': '',
      'en': '',
      'es': '',
    },
    'e1qpgvv9': {
      'pt': 'seu@email.com',
      'en': 'your@email.com',
      'es': 'tu@correoelectrónico.com',
    },
    '2fc2oefa': {
      'pt': 'Trocar senha',
      'en': 'Change password',
      'es': 'Cambiar la contraseña',
    },
    'wfuv1p55': {
      'pt': 'Senha',
      'en': 'Password',
      'es': 'Contraseña',
    },
    'bs5j5dfi': {
      'pt': '',
      'en': '',
      'es': '',
    },
    's5tie73v': {
      'pt': '***********************',
      'en': '***********************',
      'es': '***********************',
    },
    '77m0gmsp': {
      'pt': 'Sua senha está',
      'en': 'Your password is',
      'es': 'Tu contraseña es',
    },
    'miafhbog': {
      'pt': 'fraca',
      'en': 'weak',
      'es': 'débil',
    },
    '8a43q2i7': {
      'pt': 'média',
      'en': 'average',
      'es': 'promedio',
    },
    '6u38t7cc': {
      'pt': 'forte',
      'en': 'strong',
      'es': 'fuerte',
    },
    'shj4v4gw': {
      'pt': 'muito forte',
      'en': 'very strong',
      'es': 'acérrimo',
    },
    '3boobm5i': {
      'pt': 'Confirmar senha',
      'en': 'Confirm password',
      'es': 'Confirmar Contraseña',
    },
    'zo75tjko': {
      'pt': '',
      'en': '',
      'es': '',
    },
    'qo3o0qt2': {
      'pt': '***********************',
      'en': '***********************',
      'es': '***********************',
    },
    '8fv7cotg': {
      'pt': 'As senhas não coincidem.',
      'en': 'The passwords don\'t match.',
      'es': 'Las contraseñas no coinciden.',
    },
    'lth24v29': {
      'pt': 'Atualizar usuário',
      'en': 'Update user',
      'es': 'Actualizar usuario',
    },
    '1yv3t5fc': {
      'pt': '* Campo obrigatório',
      'en': '* Required field',
      'es': '* Campo obligatorio',
    },
    '7pv3n1lv': {
      'pt': 'Please choose an option from the dropdown',
      'en': 'Please choose an option from the dropdown',
      'es': 'Por favor, elija una opción del menú desplegable.',
    },
    'j9sfmo8a': {
      'pt': '* Campo obrigatório',
      'en': '* Required field',
      'es': '* Campo obligatorio',
    },
    '0y4wd5uj': {
      'pt': 'Please choose an option from the dropdown',
      'en': 'Please choose an option from the dropdown',
      'es': 'Por favor, elija una opción del menú desplegable.',
    },
    '2c8s7l4g': {
      'pt': '* Campo obrigatório',
      'en': '* Required field',
      'es': '* Campo obligatorio',
    },
    'evj5vpw2': {
      'pt': 'Please choose an option from the dropdown',
      'en': 'Please choose an option from the dropdown',
      'es': 'Por favor, elija una opción del menú desplegable.',
    },
    '0763mjtg': {
      'pt': '*********************** is required',
      'en': '*********************** is required',
      'es': '*********************** se requiere',
    },
    '21vlkq3h': {
      'pt': 'Please choose an option from the dropdown',
      'en': 'Please choose an option from the dropdown',
      'es': 'Por favor, elija una opción del menú desplegable.',
    },
    'zlzaz6fx': {
      'pt': '*********************** is required',
      'en': '*********************** is required',
      'es': '*********************** se requiere',
    },
    'w6smu83q': {
      'pt': 'Please choose an option from the dropdown',
      'en': 'Please choose an option from the dropdown',
      'es': 'Por favor, elija una opción del menú desplegable.',
    },
  },
  // modal_NovaEquipe
  {
    'mgufl5cu': {
      'pt':
          'Veja a lista de todos os funcionarios disponíveis e selecione os que entrarão na equipe',
      'en':
          'View the list of all available employees and select those who will join the team.',
      'es':
          'Vea la lista de todos los empleados disponibles y seleccione aquellos que se unirán al equipo.',
    },
    'me1b6094': {
      'pt': '01. ',
      'en': '01.',
      'es': '01.',
    },
    'a0u6n2ne': {
      'pt': 'Digite o nome da equipe: ',
      'en': 'Enter the team name:',
      'es': 'Introduzca el nombre del equipo:',
    },
    'ii72v3jl': {
      'pt': 'Digite aqui',
      'en': 'Type here',
      'es': 'Escribe aquí',
    },
    'ao7rtzcu': {
      'pt': '02. ',
      'en': '02.',
      'es': '02.',
    },
    'sagzdxhu': {
      'pt': 'Selecione um ou mais líderes de equipe',
      'en': 'Select one or more team leaders.',
      'es': 'Seleccione uno o más líderes de equipo.',
    },
    '13mvp105': {
      'pt': 'Filtros',
      'en': 'Filters',
      'es': 'Filtros',
    },
    '8ltiek0f': {
      'pt': 'Cargo',
      'en': 'Position',
      'es': 'Posición',
    },
    'lycg42mp': {
      'pt': 'Procurar por nome do funcionario',
      'en': 'Search by employee name',
      'es': 'Buscar por nombre de empleado',
    },
    'g4equpvq': {
      'pt': 'Limpar',
      'en': 'To clean',
      'es': 'Para limpiar',
    },
    'k2i9o6rt': {
      'pt': 'linhas por página:',
      'en': 'lines per page:',
      'es': 'líneas por página:',
    },
    '4ou5uuig': {
      'pt': '10',
      'en': '10',
      'es': '10',
    },
    'x2rp9sz1': {
      'pt': 'Search...',
      'en': 'Search...',
      'es': 'Buscar...',
    },
    'c64lts76': {
      'pt': '5',
      'en': '5',
      'es': '5',
    },
    'm0qcjzed': {
      'pt': '10',
      'en': '10',
      'es': '10',
    },
    'd7k7rcvp': {
      'pt': '15',
      'en': '15',
      'es': '15',
    },
    'cxuo39q7': {
      'pt': '20',
      'en': '20',
      'es': '20',
    },
    'nkoj9iu5': {
      'pt': '100',
      'en': '100',
      'es': '100',
    },
    'yq2lppkx': {
      'pt': 'Confirmar',
      'en': 'Confirm',
      'es': 'Confirmar',
    },
    'kxqe33lf': {
      'pt': 'Erro!',
      'en': 'Error!',
      'es': '¡Error!',
    },
    '2ciuomt2': {
      'pt': 'Erro!',
      'en': 'Error!',
      'es': '¡Error!',
    },
    '3eqf1noc': {
      'pt': 'Defina um ou mais Líderes',
      'en': 'Define one or more Leaders',
      'es': 'Definir uno o más líderes',
    },
    'q1tvvs0g': {
      'pt': 'Por favor, selecione um ou mais líderes para continuar.',
      'en': 'Please select one or more leaders to continue.',
      'es': 'Seleccione uno o más líderes para continuar.',
    },
    'ln3hktw8': {
      'pt': '* Campo obrigatório',
      'en': '* Required field',
      'es': '* Campo obligatorio',
    },
    'kyy4uia7': {
      'pt': 'Please choose an option from the dropdown',
      'en': 'Please choose an option from the dropdown',
      'es': 'Por favor, elija una opción del menú desplegable.',
    },
    'e7vt92qo': {
      'pt': '* Campo obrigatório',
      'en': '* Required field',
      'es': '* Campo obligatorio',
    },
    'tx6vz936': {
      'pt': 'Please choose an option from the dropdown',
      'en': 'Please choose an option from the dropdown',
      'es': 'Por favor, elija una opción del menú desplegable.',
    },
  },
  // modal_empty
  {
    'huyc2wom': {
      'pt': 'Não há dados no momento',
      'en': 'There is no data available at this time.',
      'es': 'No hay datos disponibles en este momento.',
    },
  },
  // options_colaborador
  {
    'tp2ba1so': {
      'pt': 'Editar informações',
      'en': 'Edit information',
      'es': 'Editar información',
    },
    'zvtjynxu': {
      'pt': 'Cracha',
      'en': 'Badge',
      'es': 'Insignia',
    },
    'xzoqypq7': {
      'pt': 'Remover',
      'en': 'Remove',
      'es': 'Eliminar',
    },
    'z8c6vzbl': {
      'pt': 'Erro!',
      'en': 'Error!',
      'es': '¡Error!',
    },
    '1821ihy6': {
      'pt': 'Erro!',
      'en': 'Error!',
      'es': '¡Error!',
    },
    '0zo9bg9o': {
      'pt': 'Erro!',
      'en': 'Error!',
      'es': '¡Error!',
    },
  },
  // options_trackers
  {
    'rirgrggy': {
      'pt': 'Editar tracker',
      'en': 'Edit tracker',
      'es': 'Editar rastreador',
    },
    '8ywlj10y': {
      'pt': 'Remover tracker',
      'en': 'Remove tracker',
      'es': 'Eliminar rastreador',
    },
    '1c2txuum': {
      'pt': 'Erro!',
      'en': 'Error!',
      'es': '¡Error!',
    },
  },
  // filtro_SprintBacklog
  {
    'ppuixm2b': {
      'pt': 'Sprint/Backlog',
      'en': 'Sprint/Backlog',
      'es': 'Sprint/Atraso',
    },
    'akbf4ms8': {
      'pt': 'Backlog',
      'en': 'Backlog',
      'es': 'Reserva',
    },
    'auf2wytt': {
      'pt': 'Sprint atual',
      'en': 'Current sprint',
      'es': 'Sprint actual',
    },
    'd77lp3sf': {
      'pt': 'Aplicar filtro',
      'en': 'Apply filter',
      'es': 'Aplicar filtro',
    },
  },
  // modal_AddTarefasBacklog
  {
    'bvopxdpv': {
      'pt': 'Adicionar tarefas ao backlog do projeto',
      'en': 'Add tasks to the project backlog.',
      'es': 'Agregar tareas al backlog del proyecto.',
    },
    '81qmfiu6': {
      'pt':
          'Veja todas as tarefas da plataforma e selecione quais irão para o backlog',
      'en':
          'View all tasks on the platform and select which ones will go into the backlog.',
      'es':
          'Vea todas las tareas en la plataforma y seleccione cuáles irán al backlog.',
    },
    'gv3kajr1': {
      'pt': 'Procurar por código ou descrição da tarefa',
      'en': 'Search by code or task description',
      'es': 'Buscar por código o descripción de tarea',
    },
    'wc8l3nf0': {
      'pt': 'Filtros',
      'en': 'Filters',
      'es': 'Filtros',
    },
    'inl3o4qw': {
      'pt': 'Equipamento',
      'en': 'Equipment',
      'es': 'Equipo',
    },
    'vibggrrn': {
      'pt': 'Limpar',
      'en': 'To clean',
      'es': 'Para limpiar',
    },
    'pxesbzbq': {
      'pt': 'tarefas selecionadas para o backlog',
      'en': 'tasks selected for the backlog',
      'es': 'Tareas seleccionadas para el backlog',
    },
    'zukpwj6u': {
      'pt': 'COD',
      'en': 'COD',
      'es': 'BACALAO',
    },
    'rn2ztnmc': {
      'pt': ' - Tarefa',
      'en': ' - Task',
      'es': ' - Tarea',
    },
    '29kfhii2': {
      'pt': 'Tarefa',
      'en': 'Task',
      'es': 'Tarea',
    },
    'ib44yekp': {
      'pt': 'Quantidade',
      'en': 'Amount',
      'es': 'Cantidad',
    },
    'mofvx1yp': {
      'pt': 'Unidade/Medida',
      'en': 'Unit/Measurement',
      'es': 'Unidad/Medida',
    },
    'qz2ilxbq': {
      'pt': 'Disciplina',
      'en': 'Discipline',
      'es': 'Disciplina',
    },
    '3ovk27e4': {
      'pt': 'Equipamento',
      'en': 'Equipment',
      'es': 'Equipo',
    },
    'ke4a7wbx': {
      'pt': 'Peso',
      'en': 'Weight',
      'es': 'Peso',
    },
    '2lvgklm8': {
      'pt': 'linhas por página:',
      'en': 'lines per page:',
      'es': 'líneas por página:',
    },
    '7ep0aaxk': {
      'pt': '10',
      'en': '10',
      'es': '10',
    },
    'jc82kh0i': {
      'pt': '10',
      'en': '10',
      'es': '10',
    },
    '0sdsecxb': {
      'pt': 'Search...',
      'en': 'Search...',
      'es': 'Buscar...',
    },
    'h4f80qx2': {
      'pt': '5',
      'en': '5',
      'es': '5',
    },
    '7mlm8qw1': {
      'pt': '10',
      'en': '10',
      'es': '10',
    },
    '54uygebe': {
      'pt': '15',
      'en': '15',
      'es': '15',
    },
    'rew30t34': {
      'pt': '20',
      'en': '20',
      'es': '20',
    },
    'fwche427': {
      'pt': 'Cancelar',
      'en': 'Cancel',
      'es': 'Cancelar',
    },
    '1tzp0a4s': {
      'pt': 'Mover seleção para o backlog automaticamente.',
      'en': 'Move selection to backlog automatically.',
      'es': 'Mueva la selección al backlog automáticamente.',
    },
    '3sjlrl5c': {
      'pt': 'Adicionar tarefas ao backlog',
      'en': 'Add tasks to the backlog.',
      'es': 'Agregar tareas al backlog.',
    },
    '2sr9amd8': {
      'pt':
          'Você tem certeza que deseja selecionar todas as tarefas ao backlog automaticamente?',
      'en':
          'Are you sure you want to automatically select all tasks for the backlog?',
      'es':
          '¿Está seguro de que desea seleccionar automáticamente todas las tareas para el backlog?',
    },
    'fnkmksr8': {
      'pt': 'Erro!',
      'en': 'Error!',
      'es': '¡Error!',
    },
  },
  // modal_modulosInfo
  {
    'zb7zclx6': {
      'pt': 'Modelo do módulo',
      'en': 'Module template',
      'es': 'Plantilla de módulo',
    },
    'lzuhy56n': {
      'pt': 'Fabricante',
      'en': 'Manufacturer',
      'es': 'Fabricante',
    },
    't0hoa9pw': {
      'pt': 'Tracker',
      'en': 'Tracker',
      'es': 'Rastreador',
    },
    '9953792a': {
      'pt': 'Posição no tracker',
      'en': 'Position on the tracker',
      'es': 'Posición en el rastreador',
    },
    'pihyigsd': {
      'pt': 'Tensão',
      'en': 'Voltage',
      'es': 'Voltaje',
    },
    'why86khm': {
      'pt': 'Corrente',
      'en': 'Current',
      'es': 'Actual',
    },
    'gjgdnn9c': {
      'pt': 'Corrente de curto circuito',
      'en': 'Short circuit current',
      'es': 'Corriente de cortocircuito',
    },
    'd8xmchov': {
      'pt': 'Potência',
      'en': 'Power',
      'es': 'Fuerza',
    },
    'gibx2pwe': {
      'pt': 'VCO',
      'en': 'VCO',
      'es': 'VCO',
    },
    'f1r96kzh': {
      'pt': 'VM',
      'en': 'VM',
      'es': 'Máquina virtual',
    },
    '9ls4sq80': {
      'pt': 'IM',
      'en': 'IM',
      'es': 'SOY',
    },
  },
  // options_equipe-colaborador
  {
    'aitymrmm': {
      'pt': 'Editar informações',
      'en': 'Edit information',
      'es': 'Editar información',
    },
    'md9z8oaj': {
      'pt': 'Remover',
      'en': 'Remove',
      'es': 'Eliminar',
    },
    '98iwzw5l': {
      'pt': 'Remover da equipe',
      'en': 'Remove from team',
      'es': 'Eliminar del equipo',
    },
    'yxtzt1hy': {
      'pt': 'Tem certeza que deseja remover esse colaborador da equipe?',
      'en': 'Are you sure you want to remove this employee from the team?',
      'es': '¿Está seguro de que desea eliminar a este empleado del equipo?',
    },
  },
  // options_equipe
  {
    'zqe9ixbs': {
      'pt': 'Editar informações',
      'en': 'Edit information',
      'es': 'Editar información',
    },
    'uj1bcz8k': {
      'pt': 'Remover',
      'en': 'Remove',
      'es': 'Eliminar',
    },
    'djaxwyql': {
      'pt': 'Esta ação removerá esta equipe!',
      'en': 'This action will remove this team!',
      'es': '¡Esta acción eliminará este equipo!',
    },
    '4dctwk76': {
      'pt': 'Tem certeza que deseja remover essa equipe?',
      'en': 'Are you sure you want to remove this team?',
      'es': '¿Estás seguro de que deseas eliminar este equipo?',
    },
    '6fpi5q37': {
      'pt': 'Erro!',
      'en': 'Error!',
      'es': '¡Error!',
    },
  },
  // options_projetos
  {
    '4rwzcvaj': {
      'pt': 'Ver Detalhes',
      'en': 'View Details',
      'es': 'Ver detalles',
    },
    'pgp8gz5e': {
      'pt': 'Remover',
      'en': 'Remove',
      'es': 'Eliminar',
    },
    'lxjb6d6g': {
      'pt': 'Erro!',
      'en': 'Error!',
      'es': '¡Error!',
    },
  },
  // modal_Estaca-HMP
  {
    'y04622bf': {
      'pt': 'Detalhes da estaca',
      'en': 'Stake details',
      'es': 'Detalles de la participación',
    },
    '92q8as9w': {
      'pt': 'Deseja deixar um cometário ou observação sobre essa estaca?',
      'en':
          'Would you like to leave a comment or observation about this stake?',
      'es': '¿Quieres dejar algún comentario u observación sobre esta apuesta?',
    },
    '2r8g4ja4': {
      'pt': 'HMP - Heavy Motor Pier',
      'en': 'HMP - Heavy Motor Pier',
      'es': 'HMP - Muelle para vehículos pesados',
    },
    'ry944q6s': {
      'pt': 'Comentário sobre a estaca',
      'en': 'Commentary on the stake',
      'es': 'Comentario sobre la hoguera',
    },
    'ct6pxkxl': {
      'pt': 'Digite aqui',
      'en': 'Type here',
      'es': 'Escribe aquí',
    },
    '602b2292': {
      'pt': 'Cancelar',
      'en': 'Cancel',
      'es': 'Cancelar',
    },
    '5fdsfrg2': {
      'pt': 'Editar estaca',
      'en': 'Edit stake',
      'es': 'Editar participación',
    },
  },
  // modal_info
  {
    'wvphmil5': {
      'pt': 'OK',
      'en': 'OK',
      'es': 'DE ACUERDO',
    },
  },
  // modal_ReplicarConfiguracaoFileira
  {
    'u7dg4e0y': {
      'pt': 'Replicar fileira',
      'en': 'Replicate row',
      'es': 'Replicar fila',
    },
    'q4jcrum9': {
      'pt':
          'Replicar configuração da fileira 01 em outras fileiras da mesma seção',
      'en':
          'Replicate the configuration of row 01 to other rows in the same section.',
      'es':
          'Replicar la configuración de la fila 01 a otras filas en la misma sección.',
    },
    'uqy6x4bs': {
      'pt': 'Fileiras da Seção 02',
      'en': 'Rows of Section 02',
      'es': 'Filas de la Sección 02',
    },
    '6daasq6s': {
      'pt': 'Selecionar todos',
      'en': 'Select all',
      'es': 'Seleccionar todo',
    },
    'cfqj8am6': {
      'pt': 'Confirmar',
      'en': 'Confirm',
      'es': 'Confirmar',
    },
  },
  // modal_encerrarSprint
  {
    'deipdf5d': {
      'pt': 'Tem certeza que deseja encerrar essa sprint?',
      'en': 'Are you sure you want to end this sprint?',
      'es': '¿Estás seguro de que deseas finalizar este sprint?',
    },
    'ql68bfw2': {
      'pt':
          'Todas as tarefas e subtarefas que não foram concluídas dentro da sprint serão movidas para próxima.\n\nAs tarefas e subtarefas concluídas entrarão na estatística de progresso.',
      'en':
          'All tasks and subtasks that were not completed within the sprint will be moved to the next sprint.\n\nCompleted tasks and subtasks will be included in the progress statistics.',
      'es':
          'Todas las tareas y subtareas que no se completaron durante el sprint se trasladarán al siguiente.\n\nLas tareas y subtareas completadas se incluirán en las estadísticas de progreso.',
    },
    '768yborq': {
      'pt': 'Cancelar',
      'en': 'Cancel',
      'es': 'Cancelar',
    },
    'xkd0lw9n': {
      'pt': 'Encerrar',
      'en': 'Close',
      'es': 'Cerca',
    },
    '8jowwe0f': {
      'pt': 'Erro!',
      'en': 'Error!',
      'es': '¡Error!',
    },
  },
  // modal_EditarLoteSelecionado
  {
    'p94lfb3y': {
      'pt': 'Editar campo ',
      'en': 'Edit field',
      'es': 'Editar campo',
    },
    'j7lzl68t': {
      'pt': 'Edite o campo selecionado',
      'en': 'Edit the selected field.',
      'es': 'Editar el campo seleccionado.',
    },
    'o9sz3jo6': {
      'pt': 'Dê um nome ou código de identificação do campo',
      'en': 'Give the field a name or identification code.',
      'es': 'Dale al campo un nombre o código de identificación.',
    },
    'ajbad2es': {
      'pt': '',
      'en': '',
      'es': '',
    },
    'reft246g': {
      'pt': 'Ex: Campo norte ou 01.1',
      'en': 'Ex: North field or 01.1',
      'es': 'Ej: Campo norte o 01.1',
    },
    'cvo1lib1': {
      'pt': '* Campo obrigatório',
      'en': '* Required field',
      'es': '* Campo obligatorio',
    },
    '4lwunx4f': {
      'pt': 'Please choose an option from the dropdown',
      'en': 'Please choose an option from the dropdown',
      'es': 'Por favor, elija una opción del menú desplegable.',
    },
    'b8356gph': {
      'pt': 'Deletar campo',
      'en': 'Delete field',
      'es': 'Eliminar campo',
    },
    'cmterx5x': {
      'pt': 'Deletar Lote',
      'en': 'Delete Batch',
      'es': 'Eliminar lote',
    },
    '85mir9tt': {
      'pt':
          'Essa ação é muito arriscada. Tem certeza que deseja deletar este lote e perder todas as informações geradas a partir dele?',
      'en':
          'This action is very risky. Are you sure you want to delete this batch and lose all the information generated from it?',
      'es':
          'Esta acción es muy arriesgada. ¿Está seguro de que desea eliminar este lote y perder toda la información generada?',
    },
    '8ipb1ne7': {
      'pt': 'Erro',
      'en': 'Error',
      'es': 'Error',
    },
    '25pviae7': {
      'pt': 'Salvar informações',
      'en': 'Save information',
      'es': 'Guardar información',
    },
    '9nzf181i': {
      'pt': 'Erro',
      'en': 'Error',
      'es': 'Error',
    },
  },
  // options_tarefasProjeto
  {
    'z0b0lrw1': {
      'pt': 'Editar tarefa',
      'en': 'Edit task',
      'es': 'Editar tarea',
    },
    'fdszdbcn': {
      'pt': 'Criar Subtarefas',
      'en': 'Create Subtasks',
      'es': 'Crear subtareas',
    },
    'v6csrzdm': {
      'pt': 'Remover tarefa',
      'en': 'Remove task',
      'es': 'Eliminar tarea',
    },
    'qx47nnp9': {
      'pt': 'Remover Tarefa',
      'en': 'Remove Task',
      'es': 'Eliminar tarea',
    },
    'gwgly2ox': {
      'pt': 'Tem certeza que quer remover essa tarefa do backlog do projeto?',
      'en':
          'Are you sure you want to remove this task from the project backlog?',
      'es':
          '¿Está seguro de que desea eliminar esta tarea del registro del proyecto?',
    },
    'mkih0b67': {
      'pt': 'Erro!',
      'en': 'Error!',
      'es': '¡Error!',
    },
  },
  // modal_Etapa
  {
    '8dqof8dq': {
      'pt': 'Nova Etapa / Editar Etapa',
      'en': 'New Step / Edit Step',
      'es': 'Nuevo paso / Editar paso',
    },
    'f1qtjzn4': {
      'pt':
          'Crie/edite uma nova etapa, em seguida defina as datas de início e término ',
      'en': 'Create/edit a new step, then set the start and end dates.',
      'es':
          'Cree o edite un nuevo paso y luego establezca las fechas de inicio y finalización.',
    },
    'i3p8my86': {
      'pt': 'Título da Etapa',
      'en': 'Stage Title',
      'es': 'Título de la etapa',
    },
    'f58tjrjw': {
      'pt': 'Digite um título para essa etapa',
      'en': 'Enter a title for this step.',
      'es': 'Introduzca un título para este paso.',
    },
    'wqi0eosv': {
      'pt': 'Data de início prevista',
      'en': 'Expected start date',
      'es': 'Fecha de inicio prevista',
    },
    'd653ne4k': {
      'pt': 'Selecionar data',
      'en': 'Select date',
      'es': 'Seleccionar fecha',
    },
    'c34v3r2x': {
      'pt': 'Data de término prevista',
      'en': 'Expected end date',
      'es': 'Fecha de finalización prevista',
    },
    'timak01u': {
      'pt': 'Selecionar data',
      'en': 'Select date',
      'es': 'Seleccionar fecha',
    },
    '62ql7jhb': {
      'pt': 'Criar Etapa',
      'en': 'Create Step',
      'es': 'Crear paso',
    },
    'kcwkco8l': {
      'pt': 'Salvar Etapa',
      'en': 'Save Step',
      'es': 'Guardar paso',
    },
  },
  // logout
  {
    '7az7g2pj': {
      'pt': 'Gerenciamento da Conta',
      'en': 'Account Management',
      'es': 'Gestión de cuentas',
    },
    'istm4h11': {
      'pt': 'Sair',
      'en': 'Logout',
      'es': 'Cerrar sesión',
    },
  },
  // modal_AddFileira
  {
    '0rnskhgy': {
      'pt':
          'O número da fileira é automático de acordo com a ordem da seção. Para concluir, você precisa adicionar trackers à fileira',
      'en':
          'The row number is automatically assigned according to the section order. To finish, you need to add trackers to the row.',
      'es':
          'El número de fila se asigna automáticamente según el orden de las secciones. Para finalizar, debe agregar rastreadores a la fila.',
    },
    '9qkrs88z': {
      'pt': 'Posição',
      'en': 'Position',
      'es': 'Posición',
    },
    '9c7buewv': {
      'pt': 'Tipo de tracker',
      'en': 'Tracker type',
      'es': 'Tipo de rastreador',
    },
    'lzncwjd7': {
      'pt': '*Campo obrigatório',
      'en': '*Required field',
      'es': '*Campo obligatorio',
    },
    'zweftys7': {
      'pt': 'Adicionar tipo de tracker',
      'en': 'Add tracker type',
      'es': 'Agregar tipo de rastreador',
    },
    't4722mft': {
      'pt': 'Replicar configuração para outras fileiras',
      'en': 'Replicate configuration to other rows',
      'es': 'Replicar la configuración a otras filas',
    },
    '50k0sx92': {
      'pt': 'Cancelar',
      'en': 'Cancel',
      'es': 'Cancelar',
    },
    'dsa1mekp': {
      'pt': 'Salvar configuração',
      'en': 'Save configuration',
      'es': 'Guardar configuración',
    },
    '1l3u4n2t': {
      'pt': 'Selecione os trackers',
      'en': 'Select the trackers',
      'es': 'Seleccione los rastreadores',
    },
    'xvsm39mo': {
      'pt': 'Todos os trackers precisam ser selecionados.',
      'en': 'All trackers need to be selected.',
      'es': 'Es necesario seleccionar todos los rastreadores.',
    },
  },
  // sidebar-historico
  {
    'kgjplc1w': {
      'pt': 'Histórico',
      'en': 'History',
      'es': 'Historia',
    },
    'hhd7kwge': {
      'pt': 'Recent completed tasks from your team.',
      'en': 'Recent completed tasks from your team.',
      'es': 'Tareas completadas recientemente por su equipo.',
    },
    'uinu6yk0': {
      'pt': 'Rudy Fernandez',
      'en': 'Rudy Fernandez',
      'es': 'Rudy Fernández',
    },
    '6ilooj8r': {
      'pt': '4m ago',
      'en': '4 months ago',
      'es': 'hace 4 meses',
    },
    'dhkw0yh4': {
      'pt': 'Completed ',
      'en': 'Completed',
      'es': 'Terminado',
    },
    'br5u5vfk': {
      'pt': 'Marketing Plan',
      'en': 'Marketing Plan',
      'es': 'Plan de marketing',
    },
    '6wsl8as1': {
      'pt': 'Rudy Fernandez',
      'en': 'Rudy Fernandez',
      'es': 'Rudy Fernández',
    },
    'v2vteibl': {
      'pt': '12m ago',
      'en': '12 months ago',
      'es': 'hace 12 meses',
    },
    'y7nxa2er': {
      'pt': 'Started ',
      'en': 'Started',
      'es': 'Comenzó',
    },
    'm78q8hfm': {
      'pt': 'Marketing Plan',
      'en': 'Marketing Plan',
      'es': 'Plan de marketing',
    },
    'w5bsf4r3': {
      'pt': 'Abigail Rojas',
      'en': 'Abigail Rojas',
      'es': 'Abigail Rojas',
    },
    'j2ef572i': {
      'pt': '24m ago',
      'en': '24 months ago',
      'es': 'hace 24 meses',
    },
    'yeyetu8q': {
      'pt': 'Assigned  ',
      'en': 'Assigned',
      'es': 'Asignado',
    },
    '5bgri8od': {
      'pt': 'Rudy Fernandez ',
      'en': 'Rudy Fernandez',
      'es': 'Rudy Fernández',
    },
    'p5ek02vu': {
      'pt': 'to ',
      'en': 'to',
      'es': 'a',
    },
    'roe4dlj9': {
      'pt': 'Marketing Plan',
      'en': 'Marketing Plan',
      'es': 'Plan de marketing',
    },
    '6jfsriye': {
      'pt': 'Abigail Rojas',
      'en': 'Abigail Rojas',
      'es': 'Abigail Rojas',
    },
    'thexycl4': {
      'pt': '24m ago',
      'en': '24 months ago',
      'es': 'hace 24 meses',
    },
    '26x4tzld': {
      'pt': 'Created a project: ',
      'en': 'Created a project:',
      'es': 'Creó un proyecto:',
    },
    'vz1h2dpt': {
      'pt': 'Marketing Plan',
      'en': 'Marketing Plan',
      'es': 'Plan de marketing',
    },
    'utv13wfv': {
      'pt': 'Liz Ambridge',
      'en': 'Liz Ambridge',
      'es': 'Liz Ambridge',
    },
    '86t4igai': {
      'pt': '46m ago',
      'en': '46m ago',
      'es': 'Hace 46 m',
    },
    'st4gan1e': {
      'pt': 'Sent a plan update for ',
      'en': 'Sent a plan update for',
      'es': 'Envió una actualización del plan para',
    },
    'h6ngsved': {
      'pt': 'Marketing Plan',
      'en': 'Marketing Plan',
      'es': 'Plan de marketing',
    },
  },
  // modal_dropTrackersMap
  {
    'tfap1n57': {
      'pt': 'Selecione um tipo de tracker',
      'en': 'Select a tracker type.',
      'es': 'Seleccione un tipo de rastreador.',
    },
    'luptkdep': {
      'pt': 'Search...',
      'en': 'Search...',
      'es': 'Buscar...',
    },
    'j2ev7zs5': {
      'pt': 'Tipo de tracker 01',
      'en': 'Tracker type 01',
      'es': 'Rastreador tipo 01',
    },
    '2rh80ai8': {
      'pt': 'Tipo de tracker 02',
      'en': 'Tracker type 02',
      'es': 'Rastreador tipo 02',
    },
    'rjil26g4': {
      'pt': 'Tipo de tracker 03',
      'en': 'Tracker type 03',
      'es': 'Rastreador tipo 03',
    },
  },
  // modal_addColaborador
  {
    '8eoc0bby': {
      'pt': 'Adicionar funcionário à equipe',
      'en': 'Add employee to team',
      'es': 'Agregar empleado al equipo',
    },
    'o2efw27j': {
      'pt':
          'Veja a lista de todos os funcionários disponíveis e selecione os que entrarão na equipe',
      'en':
          'View the list of all available employees and select those who will join the team.',
      'es':
          'Vea la lista de todos los empleados disponibles y seleccione aquellos que se unirán al equipo.',
    },
    'mvr6a5d8': {
      'pt': 'Filtros',
      'en': 'Filters',
      'es': 'Filtros',
    },
    'ny9m5tdp': {
      'pt': 'Cargo',
      'en': 'Position',
      'es': 'Posición',
    },
    'hzx7f5qi': {
      'pt': 'Procurar por nome do funcionario',
      'en': 'Search by employee name',
      'es': 'Buscar por nombre de empleado',
    },
    'ie3j84oe': {
      'pt': 'Limpar',
      'en': 'To clean',
      'es': 'Para limpiar',
    },
    'nheeeb5m': {
      'pt': 'linhas por página:',
      'en': 'lines per page:',
      'es': 'líneas por página:',
    },
    '1nxyxg1s': {
      'pt': '10',
      'en': '10',
      'es': '10',
    },
    'vu6xtqdo': {
      'pt': 'Search...',
      'en': 'Search...',
      'es': 'Buscar...',
    },
    'skw6xwja': {
      'pt': '5',
      'en': '5',
      'es': '5',
    },
    'shkzg9lv': {
      'pt': '10',
      'en': '10',
      'es': '10',
    },
    'ds2xijp1': {
      'pt': '15',
      'en': '15',
      'es': '15',
    },
    'mj412isr': {
      'pt': '20',
      'en': '20',
      'es': '20',
    },
    '8e3drtoe': {
      'pt': '100',
      'en': '100',
      'es': '100',
    },
    '895a2l1i': {
      'pt': 'Confirmar',
      'en': 'Confirm',
      'es': 'Confirmar',
    },
    '6f2l6596': {
      'pt': 'Erro!',
      'en': 'Error!',
      'es': '¡Error!',
    },
    '96xh5ux1': {
      'pt': 'Defina os Colaboradores',
      'en': 'Define the Collaborators',
      'es': 'Definir los colaboradores',
    },
  },
  // modal_criar_tipos_F_M_T
  {
    'x0bddg7t': {
      'pt': 'Digite o tipo',
      'en': 'Enter the type',
      'es': 'Introduzca el tipo',
    },
    '8oml0aob': {
      'pt': '* Campo obrigatório',
      'en': '* Required field',
      'es': '* Campo obligatorio',
    },
    '2uhxhcr0': {
      'pt': 'Please choose an option from the dropdown',
      'en': 'Please choose an option from the dropdown',
      'es': 'Por favor, elija una opción del menú desplegable.',
    },
  },
  // modal_CriarTarefa
  {
    'ohgnzfxi': {
      'pt':
          'Crie e edite uma nova tarefa, associando ela aos trackers, estacas, módulos ou outros do projeto.',
      'en':
          'Create and edit a new task, associating it with trackers, stakes, modules, or other project elements.',
      'es':
          'Cree y edite una nueva tarea, asociándola con rastreadores, apuestas, módulos u otros elementos del proyecto.',
    },
    '129h5rbw': {
      'pt': 'Selecione para qual equipamento essa tarefa será destinada',
      'en': 'Select the device that will be used for this task.',
      'es': 'Seleccione el dispositivo que se utilizará para esta tarea.',
    },
    'yioccsr8': {
      'pt': 'Descrição da tarefa',
      'en': 'Task description',
      'es': 'Descripción de la tarea',
    },
    '2e7rds5m': {
      'pt': 'Descreva brevemente essa tarefa',
      'en': 'Briefly describe this task.',
      'es': 'Describa brevemente esta tarea.',
    },
    'o6ytgny0': {
      'pt': 'Peso da tarefa',
      'en': 'Task weight',
      'es': 'Peso de la tarea',
    },
    'dzztgqf2': {
      'pt':
          'O peso da tarefa deve ser um multiplicador. Ex.: x0.1; x2.1 ou x3.5',
      'en': 'The task weight should be a multiplier. Ex.: x0.1; x2.1 or x3.5',
      'es':
          'El peso de la tarea debe ser un multiplicador. Ej.: x0,1; x2,1 o x3,5',
    },
    'anj7usqn': {
      'pt': '* Campo obrigatório',
      'en': '* Required field',
      'es': '* Campo obligatorio',
    },
    'uijgmpy9': {
      'pt': 'Please choose an option from the dropdown',
      'en': 'Please choose an option from the dropdown',
      'es': 'Por favor, elija una opción del menú desplegable.',
    },
    '9f7n0p8w': {
      'pt': '* Campo obrigatório',
      'en': '* Required field',
      'es': '* Campo obligatorio',
    },
    'nd19b5on': {
      'pt': 'Please choose an option from the dropdown',
      'en': 'Please choose an option from the dropdown',
      'es': 'Por favor, elija una opción del menú desplegable.',
    },
    '49x352yx': {
      'pt': 'Unidade/Medida',
      'en': 'Unit/Measurement',
      'es': 'Unidad/Medida',
    },
    '9dtsxeg7': {
      'pt': 'Selecione',
      'en': 'Select',
      'es': 'Seleccionar',
    },
    'xqgldj2r': {
      'pt': 'Search...',
      'en': 'Search...',
      'es': 'Buscar...',
    },
    'dhypkai4': {
      'pt': 'Disciplina',
      'en': 'Discipline',
      'es': 'Disciplina',
    },
    'jdmubwug': {
      'pt': 'Selecione',
      'en': 'Select',
      'es': 'Seleccionar',
    },
    'oom4cbln': {
      'pt': 'Search...',
      'en': 'Search...',
      'es': 'Buscar...',
    },
    'fq923khh': {
      'pt': '* Campo obrigatório',
      'en': '* Required field',
      'es': '* Campo obligatorio',
    },
    'w7tx6wny': {
      'pt': 'Cancelar',
      'en': 'Cancel',
      'es': 'Cancelar',
    },
    '92u07e7y': {
      'pt': 'Salvar tarefa',
      'en': 'Save task',
      'es': 'Guardar tarea',
    },
    'yjti39s2': {
      'pt': 'Erro!',
      'en': 'Error!',
      'es': '¡Error!',
    },
    'k6xp9rco': {
      'pt': 'Erro!',
      'en': 'Error!',
      'es': '¡Error!',
    },
    '1q7pgvy5': {
      'pt': 'Preencha os campos obrigatórios.',
      'en': 'Please fill in the required fields.',
      'es': 'Por favor, rellene los campos obligatorios.',
    },
    'z6s4ri7p': {
      'pt': 'Para prosseguir é preciso preencher os campos obrigatórios.',
      'en': 'To proceed, you must fill in the required fields.',
      'es': 'Para continuar, deberás rellenar los campos obligatorios.',
    },
  },
  // modal_SprintNova
  {
    '02oyn3c6': {
      'pt': 'Adicione uma nova sprint e depois associe tarefas a ela.',
      'en': 'Add a new sprint and then associate tasks with it.',
      'es': 'Añade un nuevo sprint y luego asocia tareas con él.',
    },
    'zo2p0upu': {
      'pt': 'Título da sprint',
      'en': 'Sprint title',
      'es': 'Título del sprint',
    },
    'd4wcmi9o': {
      'pt': 'Digite aqui',
      'en': 'Type here',
      'es': 'Escribe aquí',
    },
    'buega2mo': {
      'pt': 'Objetivo da sprint',
      'en': 'Sprint objective',
      'es': 'Objetivo del sprint',
    },
    '00b5wb03': {
      'pt': 'Digite aqui',
      'en': 'Type here',
      'es': 'Escribe aquí',
    },
    's0fg3qtr': {
      'pt': 'Data de início prevista',
      'en': 'Expected start date',
      'es': 'Fecha de inicio prevista',
    },
    'lhpwglno': {
      'pt': 'xx/xx/xxxx',
      'en': 'xx/xx/xxxx',
      'es': 'xx/xx/xxxx',
    },
    '5wwov9gk': {
      'pt': 'Data de término prevista',
      'en': 'Expected end date',
      'es': 'Fecha de finalización prevista',
    },
    'lpy1pymx': {
      'pt': 'xx/xx/xxxx',
      'en': 'xx/xx/xxxx',
      'es': 'xx/xx/xxxx',
    },
    'p5d4pusc': {
      'pt': 'Erro!',
      'en': 'Error!',
      'es': '¡Error!',
    },
    'lpdraq5g': {
      'pt': 'Erro!',
      'en': 'Error!',
      'es': '¡Error!',
    },
    '3jxpqc5l': {
      'pt': 'Atenção!',
      'en': 'Attention!',
      'es': '¡Atención!',
    },
    '0oay0sqs': {
      'pt': 'Data de término é menor que a data inicio.',
      'en': 'The end date is earlier than the start date.',
      'es': 'La fecha de finalización es anterior a la fecha de inicio.',
    },
    'jyv32cp4': {
      'pt': '* Campo obrigatório',
      'en': '* Required field',
      'es': '* Campo obligatorio',
    },
    'elhfasn2': {
      'pt': 'Please choose an option from the dropdown',
      'en': 'Please choose an option from the dropdown',
      'es': 'Por favor, elija una opción del menú desplegable.',
    },
    'enubgcgb': {
      'pt': '* Campo obrigatório',
      'en': '* Required field',
      'es': '* Campo obligatorio',
    },
    'bmv738hh': {
      'pt': 'Please choose an option from the dropdown',
      'en': 'Please choose an option from the dropdown',
      'es': 'Por favor, elija una opción del menú desplegable.',
    },
  },
  // filtro_statusFundacao
  {
    'p9bpyosy': {
      'pt': 'Filtrar por status da fundação',
      'en': 'Filter by foundation status',
      'es': 'Filtrar por estado de fundación',
    },
    'cfvfszjs': {
      'pt': 'Aplicar filtro',
      'en': 'Apply filter',
      'es': 'Aplicar filtro',
    },
  },
  // drop_modules
  {
    'e1ezgwqd': {
      'pt': 'Procurar',
      'en': 'To search for',
      'es': 'Para buscar',
    },
    '046ki49r': {
      'pt': 'Criar Modelo',
      'en': 'Create Template',
      'es': 'Crear plantilla',
    },
  },
  // drop_tracker
  {
    'nhnn8kft': {
      'pt': 'Procurar',
      'en': 'To search for',
      'es': 'Para buscar',
    },
    '23ug5n9x': {
      'pt': 'Criar tipo de tracker',
      'en': 'Create tracker type',
      'es': 'Crear tipo de rastreador',
    },
  },
  // modal_GraficoDePorcentagem
  {
    'j395n9fu': {
      'pt': 'Porcentagem dos estágios do projeto',
      'en': 'Percentage of project stages',
      'es': 'Porcentaje de etapas del proyecto',
    },
    '0jovi5w5': {
      'pt':
          'Veja todos os indicativos de porcentagem do andamento do projeto e faça uma filtragem para obter dados mais específicos',
      'en':
          'View all project progress percentage indicators and filter to obtain more specific data.',
      'es':
          'Ver todos los indicadores porcentuales de avance del proyecto y filtrar para obtener datos más específicos.',
    },
    'e7qk0tql': {
      'pt': 'Selecione um campo',
      'en': 'Select a field',
      'es': 'Seleccione un campo',
    },
    'ieckdrfi': {
      'pt': 'Search...',
      'en': 'Search...',
      'es': 'Buscar...',
    },
    'n3ggrdu6': {
      'pt': 'Subcampo 01',
      'en': 'Subfield 01',
      'es': 'Subcampo 01',
    },
    'utv1pd03': {
      'pt': 'Subcampo 02',
      'en': 'Subfield 02',
      'es': 'Subcampo 02',
    },
    '8tedobxn': {
      'pt': 'Subcampo 03',
      'en': 'Subfield 03',
      'es': 'Subcampo 03',
    },
    'oi33wrp7': {
      'pt': 'Selecione uma seção',
      'en': 'Select a section',
      'es': 'Seleccione una sección',
    },
    'ox49ytm1': {
      'pt': 'Search...',
      'en': 'Search...',
      'es': 'Buscar...',
    },
    'c1884hfs': {
      'pt': 'Fileira 01',
      'en': 'Row 01',
      'es': 'Fila 01',
    },
    'czleuss9': {
      'pt': 'Fileira 02',
      'en': 'Row 02',
      'es': 'Fila 02',
    },
    '2k1v3ayq': {
      'pt': 'Fileira 03',
      'en': 'Row 03',
      'es': 'Fila 03',
    },
    '6xjya7tn': {
      'pt': 'Selecione uma fileira',
      'en': 'Select a row',
      'es': 'Seleccione una fila',
    },
    '7kb9qrum': {
      'pt': 'Search...',
      'en': 'Search...',
      'es': 'Buscar...',
    },
    'hrrqsob6': {
      'pt': 'Fileira 01',
      'en': 'Row 01',
      'es': 'Fila 01',
    },
    '4xthexk9': {
      'pt': 'Fileira 02',
      'en': 'Row 02',
      'es': 'Fila 02',
    },
    '8kl4mge7': {
      'pt': 'Fileira 03',
      'en': 'Row 03',
      'es': 'Fila 03',
    },
    'g2096qmm': {
      'pt': 'Posição do tracker',
      'en': 'Tracker position',
      'es': 'Posición del rastreador',
    },
    'zsql3e2q': {
      'pt': 'Search...',
      'en': 'Search...',
      'es': 'Buscar...',
    },
    'h8zc2lhb': {
      'pt': 'Tr',
      'en': 'Tr',
      'es': 'Tr',
    },
    'nw2oay43': {
      'pt': 'Fileira 02',
      'en': 'Row 02',
      'es': 'Fila 02',
    },
    '7i2rrlgx': {
      'pt': 'Fileira 03',
      'en': 'Row 03',
      'es': 'Fila 03',
    },
    'v34okmec': {
      'pt': 'Estacas perfuradas',
      'en': 'Drilled piles',
      'es': 'Pilotes perforados',
    },
    'w2c8gin4': {
      'pt': '2000',
      'en': '2000',
      'es': '2000',
    },
    's79vowwk': {
      'pt': '55%',
      'en': '55%',
      'es': '55%',
    },
    'qlrw5av7': {
      'pt': 'Estacas cravadas',
      'en': 'Driven piles',
      'es': 'Pilotes hincados',
    },
    'h19q3tuh': {
      'pt': '2000',
      'en': '2000',
      'es': '2000',
    },
    'qza75gwk': {
      'pt': '55%',
      'en': '55%',
      'es': '55%',
    },
    'p9s40hzp': {
      'pt': 'Trackers montados',
      'en': 'Mounted Trackers',
      'es': 'Rastreadores montados',
    },
    '2k8hytei': {
      'pt': '2000',
      'en': '2000',
      'es': '2000',
    },
    'ba4x1s8t': {
      'pt': '55%',
      'en': '55%',
      'es': '55%',
    },
    'vwbvlyb2': {
      'pt': 'Módulos montados',
      'en': 'Assembled modules',
      'es': 'Módulos ensamblados',
    },
    'xhyxbsgn': {
      'pt': '2000',
      'en': '2000',
      'es': '2000',
    },
    'fyqjvbsu': {
      'pt': '55%',
      'en': '55%',
      'es': '55%',
    },
  },
  // filtro_cargo
  {
    '7athfspa': {
      'pt': 'Filtrar por cargo',
      'en': 'Filter by job title',
      'es': 'Filtrar por puesto de trabajo',
    },
    'ie4seag9': {
      'pt': 'Aplicar filtro',
      'en': 'Apply filter',
      'es': 'Aplicar filtro',
    },
  },
  // modal_ReplicarEstacas
  {
    'gg5l0a4r': {
      'pt': 'Estaca escolhida',
      'en': 'Stake chosen',
      'es': 'Estaca elegida',
    },
    'paynt25i': {
      'pt': 'Posição ',
      'en': 'Position ',
      'es': 'Posición ',
    },
    'm142mbm5': {
      'pt':
          'Deseja replicar a mesma estaca para outras posições? Selecione quantas quiser.',
      'en':
          'Do you want to replicate the same stake for other positions? Select as many as you want.',
      'es':
          '¿Quieres replicar la misma apuesta en otras posiciones? Selecciona tantas como quieras.',
    },
    'xmzl8u1b': {
      'pt': 'Cancelar',
      'en': 'Cancel',
      'es': 'Cancelar',
    },
    '9mblpbjv': {
      'pt': 'Adicionar',
      'en': 'To add',
      'es': 'Para agregar',
    },
  },
  // filtro_status
  {
    'bw1swsyy': {
      'pt': 'Sprint ou Backlog',
      'en': 'Sprint or Backlog',
      'es': 'Sprint o Backlog',
    },
    'jtzlb8g5': {
      'pt': 'Sprint',
      'en': 'Sprint',
      'es': 'Sprint',
    },
    'lzi4z79h': {
      'pt': 'Backlog',
      'en': 'Backlog',
      'es': 'Reserva',
    },
    '8qgrfdqs': {
      'pt': 'Aplicar filtro',
      'en': 'Apply filter',
      'es': 'Aplicar filtro',
    },
  },
  // modal_Estaca-HAPE
  {
    '3u2o6xlt': {
      'pt': 'Detalhes da estaca',
      'en': 'Stake details',
      'es': 'Detalles de la participación',
    },
    '1urcvw30': {
      'pt': 'Deseja deixar um cometário ou observação sobre essa estaca?',
      'en':
          'Would you like to leave a comment or observation about this stake?',
      'es': '¿Quieres dejar algún comentario u observación sobre esta apuesta?',
    },
    '5vlz1rho': {
      'pt': 'HAPE - Heavy Array Pier Edge',
      'en': 'HAPE - Heavy Array Pier Edge',
      'es': 'HAPE - Borde de muelle de matriz pesada',
    },
    '9le9nyj3': {
      'pt': 'Comentário sobre a estaca',
      'en': 'Commentary on the stake',
      'es': 'Comentario sobre la hoguera',
    },
    'lqcolvgc': {
      'pt': 'Digite aqui',
      'en': 'Type here',
      'es': 'Escribe aquí',
    },
    'qb4nuutx': {
      'pt': 'Cancelar',
      'en': 'Cancel',
      'es': 'Cancelar',
    },
    'mcv8mvbw': {
      'pt': 'Editar estaca',
      'en': 'Edit stake',
      'es': 'Editar participación',
    },
  },
  // modal_AddTarefasSprint02
  {
    'wglnghic': {
      'pt': 'Adicionar tarefas à sprint',
      'en': 'Add tasks to the sprint.',
      'es': 'Añadir tareas al sprint.',
    },
    'p88n9r9v': {
      'pt': 'Veja todas as tarefas do backlog e adicione à sprint atual',
      'en': 'View all tasks in the backlog and add them to the current sprint.',
      'es': 'Ver todas las tareas en el backlog y agregarlas al sprint actual.',
    },
    'a7il0kjn': {
      'pt': 'Procurar por código ou descrição da tarefa',
      'en': 'Search by code or task description',
      'es': 'Buscar por código o descripción de tarea',
    },
    '8va6wbn0': {
      'pt': 'Filtros',
      'en': 'Filters',
      'es': 'Filtros',
    },
    '5s8t6bl5': {
      'pt': 'Equipamento',
      'en': 'Equipment',
      'es': 'Equipo',
    },
    'tocqnorl': {
      'pt': 'Limpar',
      'en': 'To clean',
      'es': 'Para limpiar',
    },
    'c3lzlhcu': {
      'pt': 'Selecione um campo',
      'en': 'Select a field',
      'es': 'Seleccione un campo',
    },
    't1ai11zi': {
      'pt': 'Search...',
      'en': 'Search...',
      'es': 'Buscar...',
    },
    'vis6somg': {
      'pt': 'Subcampo 01',
      'en': 'Subfield 01',
      'es': 'Subcampo 01',
    },
    'hhm9zd2u': {
      'pt': 'Subcampo 02',
      'en': 'Subfield 02',
      'es': 'Subcampo 02',
    },
    'udovd4sp': {
      'pt': 'Subcampo 03',
      'en': 'Subfield 03',
      'es': 'Subcampo 03',
    },
    'gcvvfoc3': {
      'pt': 'Selecione uma seção',
      'en': 'Select a section',
      'es': 'Seleccione una sección',
    },
    '8ug33cxu': {
      'pt': 'Search...',
      'en': 'Search...',
      'es': 'Buscar...',
    },
    '81qgmiar': {
      'pt': 'Seção 01',
      'en': 'Section 01',
      'es': 'Sección 01',
    },
    'r22btaid': {
      'pt': 'Seção 02',
      'en': 'Section 02',
      'es': 'Sección 02',
    },
    '27wfvmvs': {
      'pt': 'Seção 03',
      'en': 'Section 03',
      'es': 'Sección 03',
    },
    'ebl1qui9': {
      'pt': 'Selecione uma fileira',
      'en': 'Select a row',
      'es': 'Seleccione una fila',
    },
    'hz20ydei': {
      'pt': 'Search...',
      'en': 'Search...',
      'es': 'Buscar...',
    },
    'wa5kqysm': {
      'pt': 'Fileira 01',
      'en': 'Row 01',
      'es': 'Fila 01',
    },
    'bivb0bj1': {
      'pt': 'Fileira 02',
      'en': 'Row 02',
      'es': 'Fila 02',
    },
    'pzs57qkz': {
      'pt': 'Fileira 03',
      'en': 'Row 03',
      'es': 'Fila 03',
    },
    'qyibd34w': {
      'pt': 'Posição do tracker',
      'en': 'Tracker position',
      'es': 'Posición del rastreador',
    },
    '5vptc9tt': {
      'pt': 'Search...',
      'en': 'Search...',
      'es': 'Buscar...',
    },
    '5unuxv0o': {
      'pt': 'Tracker 01',
      'en': 'Tracker 01',
      'es': 'Rastreador 01',
    },
    'i0dn7fg8': {
      'pt': 'Tracker 02',
      'en': 'Tracker 02',
      'es': 'Rastreador 02',
    },
    '33etnirb': {
      'pt': 'Tracker 03',
      'en': 'Tracker 03',
      'es': 'Rastreador 03',
    },
    'veoojsch': {
      'pt': 'tarefas selecionadas',
      'en': 'selected tasks',
      'es': 'tareas seleccionadas',
    },
    'sioecfpn': {
      'pt': 'Subtarefas selecionadas',
      'en': 'Selected subtasks',
      'es': 'Subtareas seleccionadas',
    },
    'l5prsy5d': {
      'pt': 'Tarefa',
      'en': 'Task',
      'es': 'Tarea',
    },
    '6ez11g8r': {
      'pt': 'Peso',
      'en': 'Weight',
      'es': 'Peso',
    },
    'srz5edhe': {
      'pt': 'Equipamento',
      'en': 'Equipment',
      'es': 'Equipo',
    },
    '1d1rd961': {
      'pt': 'Quantidade',
      'en': 'Amount',
      'es': 'Cantidad',
    },
    'bw21rtuo': {
      'pt': 'Unidade/Medida',
      'en': 'Unit/Measurement',
      'es': 'Unidad/Medida',
    },
    'k7a05ait': {
      'pt': 'Disciplina',
      'en': 'Discipline',
      'es': 'Disciplina',
    },
    'ui2h3phi': {
      'pt': 'Localização',
      'en': 'Location',
      'es': 'Ubicación',
    },
    '7e7lh9di': {
      'pt': ' ',
      'en': ' ',
      'es': ' ',
    },
    '1feq6dhb': {
      'pt':
          'Título da Tarefa - Breve descrição em poucas linhas sobre o que é essa tarefa',
      'en':
          'Task Title - Brief description in a few lines of what this task is.',
      'es':
          'Título de la tarea: Breve descripción en pocas líneas de lo que es esta tarea.',
    },
    'g5h0na0l': {
      'pt': 'Campo ',
      'en': 'Field ',
      'es': 'Campo ',
    },
    '9brtifws': {
      'pt': 'Subcampo 01 - ',
      'en': 'Subfield 01 -',
      'es': 'Subcampo 01 -',
    },
    '9fe3yaxy': {
      'pt': 'Seção ',
      'en': 'Section ',
      'es': 'Sección ',
    },
    'xxm1qwqa': {
      'pt': 'Subcampo 01 - ',
      'en': 'Subfield 01 -',
      'es': 'Subcampo 01 -',
    },
    'oei1lome': {
      'pt': 'Fileira ',
      'en': 'Row ',
      'es': 'Fila ',
    },
    'gqnifbpc': {
      'pt': 'Subcampo 01 - ',
      'en': 'Subfield 01 -',
      'es': 'Subcampo 01 -',
    },
    'czzys1pg': {
      'pt': 'Tracker ',
      'en': 'Tracker ',
      'es': 'Rastreador ',
    },
    'dq65ajpc': {
      'pt': 'Subcampo 01 - ',
      'en': 'Subfield 01 -',
      'es': 'Subcampo 01 -',
    },
    'a7womv3c': {
      'pt': 'Estaca  ',
      'en': 'Stake ',
      'es': 'Apostar ',
    },
    'addji35e': {
      'pt': 'Subcampo 01 - ',
      'en': 'Subfield 01 -',
      'es': 'Subcampo 01 -',
    },
    '9d3p4h8x': {
      'pt': ' Qtdd: ',
      'en': ' Qty: ',
      'es': ' Cantidad: ',
    },
    'v8zqvfsk': {
      'pt': ' - ',
      'en': ' - ',
      'es': ' - ',
    },
    'f6zcm0r9': {
      'pt':
          'Título da Tarefa - Breve descrição em poucas linhas sobre o que é essa tarefa',
      'en':
          'Task Title - Brief description in a few lines of what this task is.',
      'es':
          'Título de la tarea: Breve descripción en pocas líneas de lo que es esta tarea.',
    },
    'unpt0x2a': {
      'pt': 'linhas por página:',
      'en': 'lines per page:',
      'es': 'líneas por página:',
    },
    'q2d8wt9s': {
      'pt': '10',
      'en': '10',
      'es': '10',
    },
    'm3llimtw': {
      'pt': '10',
      'en': '10',
      'es': '10',
    },
    'b8da6nny': {
      'pt': 'Search...',
      'en': 'Search...',
      'es': 'Buscar...',
    },
    '5jdupsk5': {
      'pt': '5',
      'en': '5',
      'es': '5',
    },
    '0ebz3tiq': {
      'pt': '10',
      'en': '10',
      'es': '10',
    },
    'mf3kn63t': {
      'pt': '15',
      'en': '15',
      'es': '15',
    },
    '15ypleeq': {
      'pt': '20',
      'en': '20',
      'es': '20',
    },
    'idhnxze6': {
      'pt': '100',
      'en': '100',
      'es': '100',
    },
    'yw29b3hd': {
      'pt': 'Cancelar',
      'en': 'Cancel',
      'es': 'Cancelar',
    },
    'xiqggixa': {
      'pt': 'Mover seleção para a sprint atual',
      'en': 'Move selection to the current sprint.',
      'es': 'Mover la selección al sprint actual.',
    },
    'ju0pb9i4': {
      'pt': 'Mover seleção para sprint atual',
      'en': 'Move selection to current sprint',
      'es': 'Mover la selección al sprint actual',
    },
    'vytyrkfb': {
      'pt': 'Todas as subtarefas selecionadas entrarão para sprint atual.',
      'en': 'All selected subtasks will be included in the current sprint.',
      'es':
          'Todas las subtareas seleccionadas se incluirán en el sprint actual.',
    },
    'd173a434': {
      'pt': 'Erro',
      'en': 'Error',
      'es': 'Error',
    },
    'ft3t7ihf': {
      'pt': 'Erro',
      'en': 'Error',
      'es': 'Error',
    },
  },
  // modal_AddEstacasComentarios
  {
    'q2v8jfz5': {
      'pt': 'Estaca escolhida',
      'en': 'Stake chosen',
      'es': 'Estaca elegida',
    },
    'qqqxwryu': {
      'pt': 'Deseja deixar um cometário ou observação sobre essa estaca?',
      'en':
          'Would you like to leave a comment or observation about this stake?',
      'es': '¿Quieres dejar algún comentario u observación sobre esta apuesta?',
    },
    'aga2iouw': {
      'pt': 'Comentário sobre a estaca',
      'en': 'Commentary on the stake',
      'es': 'Comentario sobre la hoguera',
    },
    '0n6xmu32': {
      'pt': 'Digite aqui',
      'en': 'Type here',
      'es': 'Escribe aquí',
    },
    '1kfj5tck': {
      'pt': 'Cancelar',
      'en': 'Cancel',
      'es': 'Cancelar',
    },
    'gajypyz4': {
      'pt': 'Adicionar',
      'en': 'To add',
      'es': 'Para agregar',
    },
  },
  // filtro_statusTrackers
  {
    'ygnvn4w6': {
      'pt': 'Filtrar por status do tracker',
      'en': 'Filter by tracker status',
      'es': 'Filtrar por estado del rastreador',
    },
    'fny3w5yr': {
      'pt': 'Aplicar filtro',
      'en': 'Apply filter',
      'es': 'Aplicar filtro',
    },
  },
  // modal_RDO1
  {
    'aody6omy': {
      'pt': 'Criar RDO',
      'en': 'Create RDO',
      'es': 'Crear RDO',
    },
    '3nz33l4w': {
      'pt': 'Veja as escalas dos times e crie sua RDO.',
      'en': 'View the team schedules and create your RDO.',
      'es': 'Visualiza los horarios del equipo y crea tu RDO.',
    },
    's506qd5c': {
      'pt': 'Lider(es)/Cargo',
      'en': 'Leader(s)/Position',
      'es': 'Líder(es)/Posición',
    },
    'bvvh0xf9': {
      'pt': 'Equipe',
      'en': 'Team',
      'es': 'Equipo',
    },
    'buta8j97': {
      'pt': 'Dia encerrado',
      'en': 'Day ended.',
      'es': 'El día terminó.',
    },
    'qil191k2': {
      'pt': 'Criar RDO',
      'en': 'Create RDO',
      'es': 'Crear RDO',
    },
  },
  // modal_Confirm
  {
    '3y0dwypb': {
      'pt': 'Cancelar',
      'en': 'Cancel',
      'es': 'Cancelar',
    },
    'w3sh0p3j': {
      'pt': 'Confirmar',
      'en': 'Confirm',
      'es': 'Confirmar',
    },
    'hxcp7s2s': {
      'pt': 'Download concluido',
      'en': 'Download complete',
      'es': 'Descargar completo',
    },
  },
  // filtro_aparelho
  {
    '02l3jeup': {
      'pt': 'Filtrar por Equipamento',
      'en': 'Filter by Equipment',
      'es': 'Filtrar por Equipo',
    },
    't39azc8x': {
      'pt': 'Aplicar filtro',
      'en': 'Apply filter',
      'es': 'Aplicar filtro',
    },
  },
  // options_secao
  {
    'b9r6757c': {
      'pt': 'Duplicar',
      'en': 'Duplicate',
      'es': 'Duplicado',
    },
    '93qabuqj': {
      'pt': 'Deseja duplicar essa seção?',
      'en': 'Do you want to duplicate this section?',
      'es': '¿Quieres duplicar esta sección?',
    },
    'ypm05s43': {
      'pt':
          'Duplicar esta seção criará uma réplica com os mesmos conteúdos e configurações.',
      'en':
          'Duplicating this section will create a replica with the same content and settings.',
      'es':
          'Duplicar esta sección creará una réplica con el mismo contenido y configuración.',
    },
    '8xz3h8ba': {
      'pt': 'Erro',
      'en': 'Error',
      'es': 'Error',
    },
    'w4dlw1d6': {
      'pt': 'Remover seção',
      'en': 'Remove section',
      'es': 'Eliminar sección',
    },
    'e7gjvkjv': {
      'pt': 'Remover seção',
      'en': 'Remove section',
      'es': 'Eliminar sección',
    },
    'jlxwe4gt': {
      'pt': 'Essa ação irá remover a seção e todas as fileiras.',
      'en': 'This action will remove the section and all rows.',
      'es': 'Esta acción eliminará la sección y todas las filas.',
    },
    'wm5fybdm': {
      'pt': 'Erro',
      'en': 'Error',
      'es': 'Error',
    },
  },
  // modal_Estaca-SAPE
  {
    '6hvakvhi': {
      'pt': 'Detalhes da estaca',
      'en': 'Stake details',
      'es': 'Detalles de la participación',
    },
    'q8b5r65g': {
      'pt': 'Deseja deixar um cometário ou observação sobre essa estaca?',
      'en':
          'Would you like to leave a comment or observation about this stake?',
      'es': '¿Quieres dejar algún comentario u observación sobre esta apuesta?',
    },
    'mdfz4uml': {
      'pt': 'SAPE - Standart Array Pier Edge',
      'en': 'SAPE - Standard Array Pier Edge',
      'es': 'SAPE - Borde de muelle de matriz estándar',
    },
    'snmipb77': {
      'pt': 'Comentário sobre a estaca',
      'en': 'Commentary on the stake',
      'es': 'Comentario sobre la hoguera',
    },
    'e1uffkm1': {
      'pt': 'Digite aqui',
      'en': 'Type here',
      'es': 'Escribe aquí',
    },
    'ateg2tnb': {
      'pt': 'Cancelar',
      'en': 'Cancel',
      'es': 'Cancelar',
    },
    'eum01miq': {
      'pt': 'Editar estaca',
      'en': 'Edit stake',
      'es': 'Editar participación',
    },
  },
  // modal_ConfirmDelete
  {
    'y7p44lrf': {
      'pt': 'Cancelar',
      'en': 'Cancel',
      'es': 'Cancelar',
    },
    '767yxaal': {
      'pt': 'Deletar',
      'en': 'Delete',
      'es': 'Borrar',
    },
  },
  // filtro_responsavel
  {
    'fp7sajua': {
      'pt': 'Filtrar por responsável',
      'en': 'Filter by responsible party',
      'es': 'Filtrar por responsable',
    },
    '56omq87i': {
      'pt': 'Nome do colaborador',
      'en': 'Employee\'s name',
      'es': 'Nombre del empleado',
    },
    '9f070wxg': {
      'pt': 'Pesquise pelo nome do colaborador',
      'en': 'Search by collaborator name.',
      'es': 'Buscar por nombre de colaborador.',
    },
    '44imdxcq': {
      'pt': 'Randy Peterson',
      'en': 'Randy Peterson',
      'es': 'Randy Peterson',
    },
    'tm0cn3sb': {
      'pt': 'Gerente de projeto',
      'en': 'Project manager',
      'es': 'Gerente de proyecto',
    },
    'vq50vnts': {
      'pt': 'Randy Peterson',
      'en': 'Randy Peterson',
      'es': 'Randy Peterson',
    },
    '1kzj0i8d': {
      'pt': 'Gerente de projeto',
      'en': 'Project manager',
      'es': 'Gerente de proyecto',
    },
    'kd0i68pl': {
      'pt': 'Randy Peterson',
      'en': 'Randy Peterson',
      'es': 'Randy Peterson',
    },
    'ke4s115m': {
      'pt': 'Gerente de projeto',
      'en': 'Project manager',
      'es': 'Gerente de proyecto',
    },
    'fielwvzt': {
      'pt': 'Randy Peterson',
      'en': 'Randy Peterson',
      'es': 'Randy Peterson',
    },
    'ay3r9mzu': {
      'pt': 'Gerente de projeto',
      'en': 'Project manager',
      'es': 'Gerente de proyecto',
    },
    '9e4asjmh': {
      'pt': 'Randy Peterson',
      'en': 'Randy Peterson',
      'es': 'Randy Peterson',
    },
    'hxcdg920': {
      'pt': 'Gerente de projeto',
      'en': 'Project manager',
      'es': 'Gerente de proyecto',
    },
    's2cil3av': {
      'pt': 'Randy Peterson',
      'en': 'Randy Peterson',
      'es': 'Randy Peterson',
    },
    '061ccif6': {
      'pt': 'Gerente de projeto',
      'en': 'Project manager',
      'es': 'Gerente de proyecto',
    },
    'sjwzumo8': {
      'pt': 'Aplicar filtro',
      'en': 'Apply filter',
      'es': 'Aplicar filtro',
    },
  },
  // modal_AddNovaRow
  {
    '6k6t0y59': {
      'pt': 'Adicionar nova fileira',
      'en': 'Add new row',
      'es': 'Agregar nueva fila',
    },
    'c03dq5na': {
      'pt':
          'Ao adicionar nova(s) fileira(s), você pode configurar seus trackers.',
      'en': 'When adding new row(s), you can configure their trackers.',
      'es': 'Al agregar nuevas filas, puede configurar sus rastreadores.',
    },
    '6xgok70f': {
      'pt': 'Quantidade de fileiras',
      'en': 'Number of rows',
      'es': 'Número de filas',
    },
    '1xe3ote9': {
      'pt': '',
      'en': '',
      'es': '',
    },
    'imrm7u26': {
      'pt': 'Digite a quantidade ex: \"1 ou 33..\"',
      'en': 'Enter the quantity, e.g., \"1 or 33...\"',
      'es': 'Introduzca la cantidad, por ejemplo, \"1 o 33...\"',
    },
    'c9u4rlyi': {
      'pt': 'Criar nova fileira',
      'en': 'Create new row',
      'es': 'Crear nueva fila',
    },
    'pkpawwih': {
      'pt': 'Erro',
      'en': 'Error',
      'es': 'Error',
    },
  },
  // modal_RDO2
  {
    'alko39ic': {
      'pt': 'RDO Pendente',
      'en': 'RDO Pending',
      'es': 'RDO pendiente',
    },
    'wehk8ypy': {
      'pt': 'Veja todas escalas pendentes e crie sua RDO.',
      'en': 'View all pending schedules and create your RDO.',
      'es': 'Visualiza todos los horarios pendientes y crea tu RDO.',
    },
    'd54ukxan': {
      'pt': 'Selecione o dia',
      'en': 'Select the day',
      'es': 'Seleccione el día',
    },
    'js334wr2': {
      'pt': 'Search...',
      'en': 'Search...',
      'es': 'Buscar...',
    },
    'qxan8kle': {
      'pt': 'Option 1',
      'en': 'Option 1',
      'es': 'Opción 1',
    },
    'diyt6fke': {
      'pt': 'Option 2',
      'en': 'Option 2',
      'es': 'Opción 2',
    },
    '89vm697h': {
      'pt': 'Option 3',
      'en': 'Option 3',
      'es': 'Opción 3',
    },
    'nrxvqwt6': {
      'pt': 'Erro ao gerar a lista',
      'en': 'Error generating the list.',
      'es': 'Error al generar la lista.',
    },
    '1c28zp05': {
      'pt': 'Lider(es)/Cargo',
      'en': 'Leader(s)/Position',
      'es': 'Líder(es)/Posición',
    },
    'nqxcc6ci': {
      'pt': 'Equipe',
      'en': 'Team',
      'es': 'Equipo',
    },
    'ckpxish3': {
      'pt': 'Dia encerrado',
      'en': 'Day ended.',
      'es': 'El día terminó.',
    },
    'b8m5c22y': {
      'pt': 'Criar RDO',
      'en': 'Create RDO',
      'es': 'Crear RDO',
    },
    'pmprzc5d': {
      'pt': 'Deseja mesmo criar essa RDO?',
      'en': 'Do you really want to create this RDO?',
      'es': '¿Realmente quieres crear este RDO?',
    },
    '93lv9lq3': {
      'pt': 'Esta ação é irreversível.',
      'en': 'This action is irreversible.',
      'es': 'Esta acción es irreversible.',
    },
    'lyg00m6i': {
      'pt': 'Erro ao criar o RDO',
      'en': 'Error creating RDO.',
      'es': 'Error al crear RDO.',
    },
  },
  // modal_RDO
  {
    'ghyo8i3d': {
      'pt': 'Detalhes do RDO',
      'en': 'RDO Details',
      'es': 'Detalles de RDO',
    },
    'a37ru7ep': {
      'pt': 'Veja todas as tarefas do backlog e adicione à sprint atual',
      'en': 'View all tasks in the backlog and add them to the current sprint.',
      'es': 'Ver todas las tareas en el backlog y agregarlas al sprint actual.',
    },
    'ux6podk9': {
      'pt': 'Colaborador/Cargo',
      'en': 'Employee/Position',
      'es': 'Empleado/Puesto',
    },
    'zsx2d8t7': {
      'pt': 'Data de conclusão',
      'en': 'Completion date',
      'es': 'Fecha de finalización',
    },
    'fki35gre': {
      'pt': 'Sprint',
      'en': 'Sprint',
      'es': 'Sprint',
    },
    'src50k5d': {
      'pt': 'Equipe',
      'en': 'Team',
      'es': 'Equipo',
    },
    'vteh62ya': {
      'pt': 'Conclusão das tarefas',
      'en': 'Completion of tasks',
      'es': 'Finalización de tareas',
    },
    'me0w24uv': {
      'pt': 'João da Silva Moreira',
      'en': 'John of Silva Moreira',
      'es': 'Juan de Silva Moreira',
    },
    'll5u3f7i': {
      'pt': '{{Cargo}}',
      'en': '{{Position}}',
      'es': '{{Posición}}',
    },
    'evc4yt5o': {
      'pt': 'Segunda-feira',
      'en': 'Monday',
      'es': 'Lunes',
    },
    'gvb3bqg4': {
      'pt': '01/01/2025',
      'en': '01/01/2025',
      'es': '01/01/2025',
    },
    'rpif18wb': {
      'pt': 'Sprint 01',
      'en': 'Sprint 01',
      'es': 'Sprint 01',
    },
    '9ansqv6p': {
      'pt': 'Execução',
      'en': 'Execution',
      'es': 'Ejecución',
    },
    'u9oj2xcg': {
      'pt': '50%',
      'en': '50%',
      'es': '50%',
    },
    'o4tknrhn': {
      'pt': 'Tarefas do dia',
      'en': 'Tasks of the day',
      'es': 'Tareas del día',
    },
    'atl0cfyc': {
      'pt': 'Tarefa',
      'en': 'Task',
      'es': 'Tarea',
    },
    'cn0cvjl9': {
      'pt': 'Equipamento',
      'en': 'Equipment',
      'es': 'Equipo',
    },
    'h6b0k4ox': {
      'pt': 'Localização',
      'en': 'Location',
      'es': 'Ubicación',
    },
    '3k0nledv': {
      'pt': 'Status',
      'en': 'Status',
      'es': 'Estado',
    },
    '5lhuu57t': {
      'pt': 'ATK QUA 001\n',
      'en': 'ATK QUA 001',
      'es': 'ATK QUA 001',
    },
    'zsxzcdbb': {
      'pt': 'Cravação de estacas',
      'en': 'Pile driving',
      'es': 'Hincado de pilotes',
    },
    'pqs7nd3g': {
      'pt':
          'Título da Tarefa - Breve descrição em poucas linhas sobre o que é essa tarefa',
      'en':
          'Task Title - Brief description in a few lines of what this task is.',
      'es':
          'Título de la tarea: Breve descripción en pocas líneas de lo que es esta tarea.',
    },
    '08ae9znq': {
      'pt': 'Estacas',
      'en': 'Stakes',
      'es': 'Estacas',
    },
    'fk9ekk79': {
      'pt': 'Subcampo ',
      'en': 'Subfield',
      'es': 'Subcampo',
    },
    'gpx2zy8r': {
      'pt': '01',
      'en': '01',
      'es': '01',
    },
    'ccg6873m': {
      'pt': 'Subcampo 01 - ',
      'en': 'Subfield 01 -',
      'es': 'Subcampo 01 -',
    },
    'o0p6e5u3': {
      'pt': 'Seção ',
      'en': 'Section',
      'es': 'Sección',
    },
    'b0nvisem': {
      'pt': '01',
      'en': '01',
      'es': '01',
    },
    '3mqiv09y': {
      'pt': 'Subcampo 01 - ',
      'en': 'Subfield 01 -',
      'es': 'Subcampo 01 -',
    },
    'ml7fhpvk': {
      'pt': 'Fileira ',
      'en': 'Row',
      'es': 'Fila',
    },
    'fkpqn5pt': {
      'pt': '01',
      'en': '01',
      'es': '01',
    },
    '7ncgrzn3': {
      'pt': 'Subcampo 01 - ',
      'en': 'Subfield 01 -',
      'es': 'Subcampo 01 -',
    },
    'x2frz5fs': {
      'pt': 'Tracker ',
      'en': 'Tracker',
      'es': 'Rastreador',
    },
    'dkbdbzlq': {
      'pt': '01',
      'en': '01',
      'es': '01',
    },
    'nn9i692u': {
      'pt': 'Subcampo 01 - ',
      'en': 'Subfield 01 -',
      'es': 'Subcampo 01 -',
    },
    'il487b8c': {
      'pt': 'Estaca ',
      'en': 'Stake',
      'es': 'Apostar',
    },
    'fvpcipbb': {
      'pt': 'A',
      'en': 'THE',
      'es': 'EL',
    },
    'gldni3xm': {
      'pt': 'Subcampo 01 - ',
      'en': 'Subfield 01 -',
      'es': 'Subcampo 01 -',
    },
    'fula4o7z': {
      'pt': 'Concluída',
      'en': 'Completed',
      'es': 'Terminado',
    },
    '8pqpa6wo': {
      'pt': 'ATK QUA 001\n',
      'en': 'ATK QUA 001',
      'es': 'ATK QUA 001',
    },
    '1uk5cz8m': {
      'pt': 'Cravação de estacas',
      'en': 'Pile driving',
      'es': 'Hincado de pilotes',
    },
    'q4kta2oj': {
      'pt':
          'Título da Tarefa - Breve descrição em poucas linhas sobre o que é essa tarefa',
      'en':
          'Task Title - Brief description in a few lines of what this task is.',
      'es':
          'Título de la tarea: Breve descripción en pocas líneas de lo que es esta tarea.',
    },
    'q1l2elje': {
      'pt': 'Estacas',
      'en': 'Stakes',
      'es': 'Estacas',
    },
    '33krlkke': {
      'pt': 'Subcampo ',
      'en': 'Subfield',
      'es': 'Subcampo',
    },
    'ypmljomq': {
      'pt': '01',
      'en': '01',
      'es': '01',
    },
    'a2qfpauo': {
      'pt': 'Subcampo 01 - ',
      'en': 'Subfield 01 -',
      'es': 'Subcampo 01 -',
    },
    '0ciun0xo': {
      'pt': 'Seção ',
      'en': 'Section',
      'es': 'Sección',
    },
    '58zholap': {
      'pt': '01',
      'en': '01',
      'es': '01',
    },
    'zn808l7l': {
      'pt': 'Subcampo 01 - ',
      'en': 'Subfield 01 -',
      'es': 'Subcampo 01 -',
    },
    'vbrzpj1e': {
      'pt': 'Fileira ',
      'en': 'Row',
      'es': 'Fila',
    },
    '2qcu99k9': {
      'pt': '01',
      'en': '01',
      'es': '01',
    },
    'koaqkd7v': {
      'pt': 'Subcampo 01 - ',
      'en': 'Subfield 01 -',
      'es': 'Subcampo 01 -',
    },
    'wg2x6cfk': {
      'pt': 'Tracker ',
      'en': 'Tracker',
      'es': 'Rastreador',
    },
    '4lqkvzmw': {
      'pt': '01',
      'en': '01',
      'es': '01',
    },
    'h71wew35': {
      'pt': 'Subcampo 01 - ',
      'en': 'Subfield 01 -',
      'es': 'Subcampo 01 -',
    },
    '6wl6o5kd': {
      'pt': 'Estaca ',
      'en': 'Stake',
      'es': 'Apostar',
    },
    'nssol8t0': {
      'pt': 'A',
      'en': 'THE',
      'es': 'EL',
    },
    '5p6xn0kw': {
      'pt': 'Subcampo 01 - ',
      'en': 'Subfield 01 -',
      'es': 'Subcampo 01 -',
    },
    'yr7p2mrw': {
      'pt': 'Concluída',
      'en': 'Completed',
      'es': 'Terminado',
    },
    'rx3lg66j': {
      'pt': 'ATK QUA 001\n',
      'en': 'ATK QUA 001',
      'es': 'ATK QUA 001',
    },
    'tgrnhha0': {
      'pt': 'Cravação de estacas',
      'en': 'Pile driving',
      'es': 'Hincado de pilotes',
    },
    'iz63t28r': {
      'pt':
          'Título da Tarefa - Breve descrição em poucas linhas sobre o que é essa tarefa',
      'en':
          'Task Title - Brief description in a few lines of what this task is.',
      'es':
          'Título de la tarea: Breve descripción en pocas líneas de lo que es esta tarea.',
    },
    'a3yemfv2': {
      'pt': 'Estacas',
      'en': 'Stakes',
      'es': 'Estacas',
    },
    'dw4bslc3': {
      'pt': 'Subcampo ',
      'en': 'Subfield',
      'es': 'Subcampo',
    },
    'vq8eb41w': {
      'pt': '01',
      'en': '01',
      'es': '01',
    },
    '2b7ou5rg': {
      'pt': 'Subcampo 01 - ',
      'en': 'Subfield 01 -',
      'es': 'Subcampo 01 -',
    },
    'lpkx7h9f': {
      'pt': 'Seção ',
      'en': 'Section',
      'es': 'Sección',
    },
    'bospo9up': {
      'pt': '01',
      'en': '01',
      'es': '01',
    },
    'az0tyhsk': {
      'pt': 'Subcampo 01 - ',
      'en': 'Subfield 01 -',
      'es': 'Subcampo 01 -',
    },
    'mmoqutjf': {
      'pt': 'Fileira ',
      'en': 'Row',
      'es': 'Fila',
    },
    'qmnukjk9': {
      'pt': '01',
      'en': '01',
      'es': '01',
    },
    'ao8dw7kw': {
      'pt': 'Subcampo 01 - ',
      'en': 'Subfield 01 -',
      'es': 'Subcampo 01 -',
    },
    '61lhyjji': {
      'pt': 'Tracker ',
      'en': 'Tracker',
      'es': 'Rastreador',
    },
    'trw2a4ro': {
      'pt': '01',
      'en': '01',
      'es': '01',
    },
    'kyn86i3b': {
      'pt': 'Subcampo 01 - ',
      'en': 'Subfield 01 -',
      'es': 'Subcampo 01 -',
    },
    '49tzleou': {
      'pt': 'Estaca ',
      'en': 'Stake',
      'es': 'Apostar',
    },
    'qsfkjk8g': {
      'pt': 'A',
      'en': 'THE',
      'es': 'EL',
    },
    'og5dyqom': {
      'pt': 'Subcampo 01 - ',
      'en': 'Subfield 01 -',
      'es': 'Subcampo 01 -',
    },
    'pwvyt18c': {
      'pt': 'Não concluída',
      'en': 'Not completed',
      'es': 'No completado',
    },
    'p7w0ms3k': {
      'pt': 'ATK QUA 001\n',
      'en': 'ATK QUA 001',
      'es': 'ATK QUA 001',
    },
    '1vy36k7j': {
      'pt': 'Cravação de estacas',
      'en': 'Pile driving',
      'es': 'Hincado de pilotes',
    },
    'dhmqfjg7': {
      'pt':
          'Título da Tarefa - Breve descrição em poucas linhas sobre o que é essa tarefa',
      'en':
          'Task Title - Brief description in a few lines of what this task is.',
      'es':
          'Título de la tarea: Breve descripción en pocas líneas de lo que es esta tarea.',
    },
    'lxk0suf2': {
      'pt': 'Estacas',
      'en': 'Stakes',
      'es': 'Estacas',
    },
    '15pj5cy2': {
      'pt': 'Subcampo ',
      'en': 'Subfield',
      'es': 'Subcampo',
    },
    'uxtg731v': {
      'pt': '01',
      'en': '01',
      'es': '01',
    },
    'p1k3tcc9': {
      'pt': 'Subcampo 01 - ',
      'en': 'Subfield 01 -',
      'es': 'Subcampo 01 -',
    },
    'k085p9uh': {
      'pt': 'Seção ',
      'en': 'Section',
      'es': 'Sección',
    },
    'dvvvyvg6': {
      'pt': '01',
      'en': '01',
      'es': '01',
    },
    'hk55klas': {
      'pt': 'Subcampo 01 - ',
      'en': 'Subfield 01 -',
      'es': 'Subcampo 01 -',
    },
    'yc91u66s': {
      'pt': 'Fileira ',
      'en': 'Row',
      'es': 'Fila',
    },
    'hhocv4cy': {
      'pt': '01',
      'en': '01',
      'es': '01',
    },
    'rcrvj5ta': {
      'pt': 'Subcampo 01 - ',
      'en': 'Subfield 01 -',
      'es': 'Subcampo 01 -',
    },
    'gmgs115r': {
      'pt': 'Tracker ',
      'en': 'Tracker',
      'es': 'Rastreador',
    },
    'gl8u97jq': {
      'pt': '01',
      'en': '01',
      'es': '01',
    },
    '16a0dcda': {
      'pt': 'Subcampo 01 - ',
      'en': 'Subfield 01 -',
      'es': 'Subcampo 01 -',
    },
    'nccutszk': {
      'pt': 'Estaca ',
      'en': 'Stake',
      'es': 'Apostar',
    },
    '9125w9bu': {
      'pt': 'A',
      'en': 'THE',
      'es': 'EL',
    },
    'u7wajun3': {
      'pt': 'Subcampo 01 - ',
      'en': 'Subfield 01 -',
      'es': 'Subcampo 01 -',
    },
    'lmhhwspg': {
      'pt': 'Não concluída',
      'en': 'Not completed',
      'es': 'No completado',
    },
    'mnithf66': {
      'pt': 'Escala de colaboradores',
      'en': 'Staffing scale',
      'es': 'Escala de personal',
    },
    'dvcjmrbh': {
      'pt': 'Procurar por nome do colaborador',
      'en': 'Search by employee name',
      'es': 'Buscar por nombre de empleado',
    },
    'g8ol630o': {
      'pt': 'Imagens da obra',
      'en': 'Images of the work',
      'es': 'Imágenes de la obra',
    },
  },
  // modal_novoCampo
  {
    'k1k0akt4': {
      'pt': 'Adicionar novo campo',
      'en': 'Add new field',
      'es': 'Añadir nuevo campo',
    },
    '7skyqwh5': {
      'pt': 'Defina o nome para o seu campo',
      'en': 'Define the name for your field.',
      'es': 'Define el nombre para tu campo.',
    },
    '64ggvkwu': {
      'pt': 'Dê um nome ou código de identificação do campo',
      'en': 'Give the field a name or identification code.',
      'es': 'Dale al campo un nombre o código de identificación.',
    },
    'r9xu6ll6': {
      'pt': '',
      'en': '',
      'es': '',
    },
    '06qjpo5k': {
      'pt': 'Ex: Campo norte ou 01.1',
      'en': 'Ex: North field or 01.1',
      'es': 'Ej: Campo norte o 01.1',
    },
    'oeoxqt8i': {
      'pt': '* Campo obrigatório',
      'en': '* Required field',
      'es': '* Campo obligatorio',
    },
    'gufe5xa9': {
      'pt': 'Please choose an option from the dropdown',
      'en': 'Please choose an option from the dropdown',
      'es': 'Por favor, elija una opción del menú desplegable.',
    },
    'x1h7jgsz': {
      'pt': 'Criar novo campo',
      'en': 'Create new field',
      'es': 'Crear nuevo campo',
    },
    '31moi4rj': {
      'pt': 'Erro',
      'en': 'Error',
      'es': 'Error',
    },
  },
  // modal_Estaca-SMP
  {
    'lkyab7yr': {
      'pt': 'Detalhes da estaca',
      'en': 'Stake details',
      'es': 'Detalles de la participación',
    },
    'f86e21zl': {
      'pt': 'Deseja deixar um cometário ou observação sobre essa estaca?',
      'en':
          'Would you like to leave a comment or observation about this stake?',
      'es': '¿Quieres dejar algún comentario u observación sobre esta apuesta?',
    },
    '2rbiebwr': {
      'pt': 'SMP - Standart Motor Pier',
      'en': 'SMP - Standard Motor Pier',
      'es': 'SMP - Muelle de motor estándar',
    },
    '8f8kjr0t': {
      'pt': 'Comentário sobre a estaca',
      'en': 'Commentary on the stake',
      'es': 'Comentario sobre la hoguera',
    },
    'brw8a1yn': {
      'pt': 'Digite aqui',
      'en': 'Type here',
      'es': 'Escribe aquí',
    },
    'c594zgey': {
      'pt': 'Cancelar',
      'en': 'Cancel',
      'es': 'Cancelar',
    },
    'fy5rav88': {
      'pt': 'Editar estaca',
      'en': 'Edit stake',
      'es': 'Editar participación',
    },
  },
  // modal_AddEstacas
  {
    'f5r9wqea': {
      'pt': 'Adicionar nova estaca',
      'en': 'Add new stake',
      'es': 'Añadir nueva participación',
    },
    'z0sn2sp8': {
      'pt':
          'Escolha qual tipo de estaca você quer adicionar depois clique em continuar',
      'en': 'Choose which type of stake you want to add, then click continue.',
      'es':
          'Elige el tipo de participación que deseas agregar y luego haz clic en continuar.',
    },
    'mnlfbrtm': {
      'pt': 'Escolha um tipo de estaca para continuar',
      'en': 'Choose a type of stake to continue.',
      'es': 'Elige un tipo de apuesta para continuar.',
    },
    '5i0w1a1q': {
      'pt': 'Cancelar',
      'en': 'Cancel',
      'es': 'Cancelar',
    },
    'iptj96z0': {
      'pt': 'Continuar',
      'en': 'Continue',
      'es': 'Continuar',
    },
  },
  // options_tarefasSprint
  {
    'f1trvczt': {
      'pt': 'Editar equipe',
      'en': 'Edit team',
      'es': 'Equipo de edición',
    },
    'wqyuri7d': {
      'pt': 'Remover Sprint',
      'en': 'Remove Sprint',
      'es': 'Eliminar Sprint',
    },
  },
  // modal_Estaca-HAP
  {
    'im67g8or': {
      'pt': 'Detalhes da estaca',
      'en': 'Stake details',
      'es': 'Detalles de la participación',
    },
    'ycqx2o8e': {
      'pt': 'Deseja deixar um cometário ou observação sobre essa estaca?',
      'en':
          'Would you like to leave a comment or observation about this stake?',
      'es': '¿Quieres dejar algún comentario u observación sobre esta apuesta?',
    },
    '24273o9w': {
      'pt': 'HAP - Heavy Array Pier',
      'en': 'HAP - Heavy Array Pier',
      'es': 'HAP - Muelle de matriz pesada',
    },
    'w5pkaprp': {
      'pt': 'Comentário sobre a estaca',
      'en': 'Commentary on the stake',
      'es': 'Comentario sobre la hoguera',
    },
    'f2ahe0a1': {
      'pt': 'Digite aqui',
      'en': 'Type here',
      'es': 'Escribe aquí',
    },
    '47sqqkdw': {
      'pt': 'Cancelar',
      'en': 'Cancel',
      'es': 'Cancelar',
    },
    'ymtwfvfe': {
      'pt': 'Editar estaca',
      'en': 'Edit stake',
      'es': 'Editar participación',
    },
  },
  // options_tarefas
  {
    '14p4bxkk': {
      'pt': 'Editar tarefa',
      'en': 'Edit task',
      'es': 'Editar tarea',
    },
    'y4ty0vsp': {
      'pt': 'Deletar',
      'en': 'Delete',
      'es': 'Borrar',
    },
    'ps5k4bqj': {
      'pt': 'Deletetar Tarefa',
      'en': 'Delete Task',
      'es': 'Eliminar tarea',
    },
    'zqjuqgnd': {
      'pt':
          'Tem certeza que deseja deletar essa tarefa? Você perderaá todos os registros dela.',
      'en':
          'Are you sure you want to delete this task? You will lose all records of it.',
      'es':
          '¿Seguro que desea eliminar esta tarea? Perderá todos sus registros.',
    },
    '3cn71kkb': {
      'pt': 'Erro!',
      'en': 'Error!',
      'es': '¡Error!',
    },
  },
  // tab_rdo
  {
    'hmqrgtp2': {
      'pt': 'Tarefas do dia',
      'en': 'Tasks of the day',
      'es': 'Tareas del día',
    },
    '5y0b3djt': {
      'pt': 'Tarefa',
      'en': 'Task',
      'es': 'Tarea',
    },
    'imgbz18i': {
      'pt': 'Equipamento',
      'en': 'Equipment',
      'es': 'Equipo',
    },
    'hgy1ua3h': {
      'pt': 'Localização',
      'en': 'Location',
      'es': 'Ubicación',
    },
    'birrqmjj': {
      'pt': 'Status',
      'en': 'Status',
      'es': 'Estado',
    },
    'glutc6ap': {
      'pt': '\n',
      'en': '\n',
      'es': '\n',
    },
    'bl2seaq7': {
      'pt':
          'Título da Tarefa - Breve descrição em poucas linhas sobre o que é essa tarefa',
      'en':
          'Task Title - Brief description in a few lines of what this task is.',
      'es':
          'Título de la tarea: Breve descripción en pocas líneas de lo que es esta tarea.',
    },
    'gr0wxvca': {
      'pt': 'Qtd da tarefa: ',
      'en': 'Task quantity: ',
      'es': 'Cantidad de tareas: ',
    },
    'xpe8pclh': {
      'pt': ' ',
      'en': ' ',
      'es': ' ',
    },
    'q42ogi41': {
      'pt': 'Quantidade da tarefa',
      'en': 'Task quantity',
      'es': 'Cantidad de tareas',
    },
    'ejiol06v': {
      'pt': 'Qtd executada: ',
      'en': 'Quantity executed: ',
      'es': 'Cantidad ejecutada: ',
    },
    'mhi5jict': {
      'pt': ' ',
      'en': ' ',
      'es': ' ',
    },
    'v21gtpso': {
      'pt': 'Quantidade da tarefa',
      'en': 'Task quantity',
      'es': 'Cantidad de tareas',
    },
    'v5myie0v': {
      'pt': 'Campo ',
      'en': 'Field ',
      'es': 'Campo ',
    },
    'nbyz75qf': {
      'pt': 'Subcampo 01 - ',
      'en': 'Subfield 01 -',
      'es': 'Subcampo 01 -',
    },
    'fpcawoer': {
      'pt': 'Seção ',
      'en': 'Section ',
      'es': 'Sección ',
    },
    'dw0zvvzy': {
      'pt': 'Subcampo 01 - ',
      'en': 'Subfield 01 -',
      'es': 'Subcampo 01 -',
    },
    'fvh6dzh0': {
      'pt': 'Fileira ',
      'en': 'Row ',
      'es': 'Fila ',
    },
    'rniys8tf': {
      'pt': 'Subcampo 01 - ',
      'en': 'Subfield 01 -',
      'es': 'Subcampo 01 -',
    },
    'u2qjtq6l': {
      'pt': 'Tracker ',
      'en': 'Tracker ',
      'es': 'Rastreador ',
    },
    'hl1q1wrv': {
      'pt': 'Subcampo 01 - ',
      'en': 'Subfield 01 -',
      'es': 'Subcampo 01 -',
    },
    'jqb70sn7': {
      'pt': 'Estaca ',
      'en': 'Stake ',
      'es': 'Apostar ',
    },
    'rc8gs56c': {
      'pt': 'Subcampo 01 - ',
      'en': 'Subfield 01 -',
      'es': 'Subcampo 01 -',
    },
    '95k6rvyg': {
      'pt': 'Concluída',
      'en': 'Completed',
      'es': 'Terminado',
    },
    'ndswzapf': {
      'pt': 'Não concluída',
      'en': 'Not completed',
      'es': 'No completado',
    },
    'o5v8duc9': {
      'pt': 'Escala de colaboradores',
      'en': 'Staffing scale',
      'es': 'Escala de personal',
    },
    '2dfg114y': {
      'pt': 'Imagens da obra',
      'en': 'Images of the work',
      'es': 'Imágenes de la obra',
    },
  },
  // modal_empty2
  {
    'eto0yzrb': {
      'pt': 'Informe a quantidade de estacas.',
      'en': 'Please specify the number of stakes.',
      'es': 'Por favor, especifique el número de participaciones.',
    },
  },
  // Card
  {
    'g6m7rtgv': {
      'pt': 'Sales',
      'en': 'Sales',
      'es': 'Ventas',
    },
    'n3e3duph': {
      'pt': 'Total Sales Today',
      'en': 'Total Sales Today',
      'es': 'Ventas totales hoy',
    },
    'droup3oi': {
      'pt': '\$500.20',
      'en': '\$500.20',
      'es': '\$500.20',
    },
    'oth5croz': {
      'pt': '55%',
      'en': '55%',
      'es': '55%',
    },
  },
  // drop_manufactures
  {
    'hhdwsf0x': {
      'pt': 'Procurar',
      'en': 'To search for',
      'es': 'Para buscar',
    },
    '6ogm4jb4': {
      'pt': 'Criar Fabricante',
      'en': 'Create Manufacturer',
      'es': 'Crear fabricante',
    },
  },
  // navBar
  {
    'nxz5g2yc': {
      'pt': 'Páginas principais',
      'en': 'Main pages',
      'es': 'Páginas principales',
    },
    'fv16avc2': {
      'pt': 'IA (Em breve)',
      'en': 'AI (Coming soon)',
      'es': 'IA (próximamente)',
    },
    '28gtw5le': {
      'pt': 'Módulos',
      'en': 'Modules',
      'es': 'Módulos',
    },
    'rc60mpn9': {
      'pt': 'Trackers',
      'en': 'Trackers',
      'es': 'Rastreadores',
    },
    'p1zmk45p': {
      'pt': 'Tarefas',
      'en': 'Tasks',
      'es': 'Tareas',
    },
    'p2qjpe3l': {
      'pt': 'Funcionários',
      'en': 'Employees',
      'es': 'Empleados',
    },
    'q11e8mps': {
      'pt': 'Projetos',
      'en': 'Projects',
      'es': 'Proyectos',
    },
    'wlf5s38g': {
      'pt': 'Language',
      'en': '',
      'es': '',
    },
    '6o3kmwog': {
      'pt': 'Search...',
      'en': '',
      'es': '',
    },
    'nz9qbsq8': {
      'pt': 'Português',
      'en': 'Portuguese',
      'es': 'Portugués',
    },
    'pidaum8w': {
      'pt': 'English',
      'en': 'English',
      'es': 'Inglés',
    },
    'gd68mgn4': {
      'pt': 'Español',
      'en': 'Spanish',
      'es': 'Español',
    },
  },
  // modal_addUsuario
  {
    'hv0oq6kz': {
      'pt':
          'Preencha todos os dados para o funcionario conseguir acessar a plataforma',
      'en':
          'Fill in all the information so the employee can access the platform.',
      'es':
          'Complete todos los datos para que el empleado pueda acceder a la plataforma.',
    },
    'hmedpafq': {
      'pt': 'Nome',
      'en': 'Name',
      'es': 'Nombre',
    },
    '5uokds4d': {
      'pt': '',
      'en': '',
      'es': '',
    },
    'iocqi7xz': {
      'pt': 'João Silva',
      'en': 'John Silva',
      'es': 'Juan Silva',
    },
    'x0sm9p3u': {
      'pt': 'Telefone',
      'en': 'Telephone',
      'es': 'Teléfono',
    },
    'inxcmp48': {
      'pt': '',
      'en': '',
      'es': '',
    },
    'wmui1mck': {
      'pt': '(12) 3 4567-8912',
      'en': '(12) 3 4567-8912',
      'es': '(12) 3 4567-8912',
    },
    'rgwef68m': {
      'pt': 'Email',
      'en': 'E-mail',
      'es': 'Correo electrónico',
    },
    'rclljcyr': {
      'pt': '',
      'en': '',
      'es': '',
    },
    'r8x9n5x1': {
      'pt': 'novo@email.com',
      'en': 'novo@email.com',
      'es': 'novo@email.com',
    },
    'ghgi7mnr': {
      'pt': 'Tipos de cargo',
      'en': 'Job types',
      'es': 'Tipos de trabajo',
    },
    'patqor33': {
      'pt': 'Selecione um cargo',
      'en': 'Select a position',
      'es': 'Seleccione una posición',
    },
    '6ny4cj95': {
      'pt': 'Procurar...',
      'en': 'To search for...',
      'es': 'Para buscar...',
    },
    'cpuk0unp': {
      'pt': 'Técnico de Manutenção',
      'en': 'Maintenance Technician',
      'es': 'Técnico de mantenimiento',
    },
    '0m1f5a9h': {
      'pt': 'Qualidade',
      'en': 'Quality',
      'es': 'Calidad',
    },
    'y6gkkz45': {
      'pt': 'Engenheiro',
      'en': 'Engineer',
      'es': 'Ingeniero',
    },
    'iswqov73': {
      'pt': 'Arquiteto',
      'en': 'Architect',
      'es': 'Arquitecto',
    },
    'phd6zn5h': {
      'pt': '*Campo obrigatório',
      'en': '*Required field',
      'es': '*Campo obligatorio',
    },
    'tiyjpyru': {
      'pt': 'Tipos de acesso',
      'en': 'Types of access',
      'es': 'Tipos de acceso',
    },
    'vfbq3e4t': {
      'pt': 'Selecione um tipo de acesso',
      'en': 'Select an access type.',
      'es': 'Seleccione un tipo de acceso.',
    },
    'yfj5c0ja': {
      'pt': 'Search...',
      'en': 'Search...',
      'es': 'Buscar...',
    },
    't6bczkzx': {
      'pt': 'Painel',
      'en': 'Panel',
      'es': 'Panel',
    },
    'r40c5460': {
      'pt': 'App',
      'en': 'App',
      'es': 'Aplicación',
    },
    'mamwvw8f': {
      'pt': 'Painel e App',
      'en': 'Dashboard and App',
      'es': 'Panel de control y aplicación',
    },
    'g8ru6pse': {
      'pt': 'Nenhum acesso',
      'en': 'No access',
      'es': 'Sin acceso',
    },
    'tomjzeoe': {
      'pt': '*Campo obrigatório',
      'en': '*Required field',
      'es': '*Campo obligatorio',
    },
    'aykjk1mv': {
      'pt': 'Niveis de acesso',
      'en': 'Access levels',
      'es': 'Niveles de acceso',
    },
    'd7qt1lfh': {
      'pt': 'Selecione o nível de acesso',
      'en': 'Select the access level.',
      'es': 'Seleccione el nivel de acceso.',
    },
    'qhxi01zf': {
      'pt': 'Search...',
      'en': 'Search...',
      'es': 'Buscar...',
    },
    '28d9pwvk': {
      'pt': 'Administrador',
      'en': 'Administrator',
      'es': 'Administrador',
    },
    '3aug4c3l': {
      'pt': 'Editor',
      'en': 'Editor',
      'es': 'Editor',
    },
    '7mpf8jje': {
      'pt': 'Apenas visualizar',
      'en': 'View only',
      'es': 'Sólo ver',
    },
    'n7r00bbo': {
      'pt': '*Campo obrigatório',
      'en': '*Required field',
      'es': '*Campo obligatorio',
    },
    'y9lx4lbf': {
      'pt': 'Cadastrar usuário',
      'en': 'Register user',
      'es': 'Registrar usuario',
    },
    'jllfyq5c': {
      'pt': 'Erro!',
      'en': 'Error!',
      'es': '¡Error!',
    },
    'u7xxvjt6': {
      'pt': 'Erro!',
      'en': 'Error!',
      'es': '¡Error!',
    },
    'f8leuwue': {
      'pt': 'Erro!',
      'en': 'Error!',
      'es': '¡Error!',
    },
    '9ljvayj4': {
      'pt': 'Atualizar usuário',
      'en': 'Update user',
      'es': 'Actualizar usuario',
    },
    'ertjleh2': {
      'pt': 'Erro!',
      'en': 'Error!',
      'es': '¡Error!',
    },
    '4eoxsd0r': {
      'pt': '*Campo obrigatório',
      'en': '*Required field',
      'es': '*Campo obligatorio',
    },
    '3oeexxon': {
      'pt': 'Please choose an option from the dropdown',
      'en': 'Please choose an option from the dropdown',
      'es': 'Por favor, elija una opción del menú desplegable.',
    },
    'o0520iu8': {
      'pt': '*Campo obrigatório',
      'en': '*Required field',
      'es': '*Campo obligatorio',
    },
    'ni7ix375': {
      'pt': 'Please choose an option from the dropdown',
      'en': 'Please choose an option from the dropdown',
      'es': 'Por favor, elija una opción del menú desplegable.',
    },
    'hzmc8dpc': {
      'pt': '*Campo obrigatório',
      'en': '*Required field',
      'es': '*Campo obligatorio',
    },
    'd628zcrh': {
      'pt': 'Please choose an option from the dropdown',
      'en': 'Please choose an option from the dropdown',
      'es': 'Por favor, elija una opción del menú desplegable.',
    },
  },
  // filtro_equipe
  {
    '1xwoaziv': {
      'pt': 'Filtrar por equipe',
      'en': 'Filter by team',
      'es': 'Filtrar por equipo',
    },
    'je0loivo': {
      'pt': 'Aplicar filtro',
      'en': 'Apply filter',
      'es': 'Aplicar filtro',
    },
  },
  // calendar
  {
    'gxnfeuy4': {
      'pt': 'Cancelar',
      'en': 'Cancel',
      'es': 'Cancelar',
    },
    '4l7qhwc8': {
      'pt': 'Ok',
      'en': 'OK',
      'es': 'DE ACUERDO',
    },
  },
  // drop_manufactures_trackers
  {
    '2t72zyic': {
      'pt': 'Procurar',
      'en': 'To search for',
      'es': 'Para buscar',
    },
    '7ksk4ism': {
      'pt': 'Criar Fabricante',
      'en': 'Create Manufacturer',
      'es': 'Crear fabricante',
    },
  },
  // options_RDO
  {
    '8no4virk': {
      'pt': 'Ver detalhes',
      'en': 'View details',
      'es': 'Ver detalles',
    },
    'lkycv630': {
      'pt': 'Deletar',
      'en': 'Delete',
      'es': 'Borrar',
    },
    '8v16fek0': {
      'pt': 'Remover colaborador',
      'en': 'Remove collaborator',
      'es': 'Eliminar colaborador',
    },
    '0kw1v7lu': {
      'pt': 'Tem certeza que deseja remover esse colaborador?',
      'en': 'Are you sure you want to remove this collaborator?',
      'es': '¿Estás seguro de que deseas eliminar a este colaborador?',
    },
  },
  // filtro_TipodeTracker
  {
    'byqiqfnh': {
      'pt': 'Filtrar por tipo de tracker',
      'en': 'Filter by tracker type',
      'es': 'Filtrar por tipo de rastreador',
    },
    'wz7edyn5': {
      'pt': 'Aplicar filtro',
      'en': 'Apply filter',
      'es': 'Aplicar filtro',
    },
  },
  // modal_AddTarefasSprint01
  {
    'wkwh1zy6': {
      'pt': 'Escolher equipe responsável',
      'en': 'Choosing the responsible team',
      'es': 'Elegir el equipo responsable',
    },
    'xp5ktlnq': {
      'pt':
          'Veja a lista de todos os colaboradores disponíveis e selecione os que estarão associados',
      'en':
          'View the list of all available collaborators and select those who will be associated.',
      'es':
          'Vea la lista de todos los colaboradores disponibles y seleccione aquellos que estarán asociados.',
    },
    'qjz7v2z7': {
      'pt': 'Antes de adicionar as tarefas, escolha a equipe!',
      'en': 'Before adding tasks, choose your team!',
      'es': '¡Antes de agregar tareas, elige tu equipo!',
    },
    'gkgs1g8m': {
      'pt': 'Erro',
      'en': 'Error',
      'es': 'Error',
    },
    'rok8rees': {
      'pt': 'Cancelar',
      'en': 'Cancel',
      'es': 'Cancelar',
    },
    'hwr8elup': {
      'pt': 'Erro',
      'en': 'Error',
      'es': 'Error',
    },
    'cekgza7o': {
      'pt': 'Sua equipe foi editada',
      'en': 'Your team has been edited.',
      'es': 'Tu equipo ha sido editado.',
    },
    'q59ttcjh': {
      'pt': 'Dados salvo com sucesso.',
      'en': 'Data saved successfully.',
      'es': 'Datos guardados exitosamente.',
    },
    'szimoncz': {
      'pt': 'Erro',
      'en': 'Error',
      'es': 'Error',
    },
    'vp3h54t2': {
      'pt': 'Erro',
      'en': 'Error',
      'es': 'Error',
    },
  },
  // modal_Estaca-SAP
  {
    'huo1es54': {
      'pt': 'Detalhes da estaca',
      'en': 'Stake details',
      'es': 'Detalles de la participación',
    },
    'zuczbp1d': {
      'pt': 'Deseja deixar um cometário ou observação sobre essa estaca?',
      'en':
          'Would you like to leave a comment or observation about this stake?',
      'es': '¿Quieres dejar algún comentario u observación sobre esta apuesta?',
    },
    'fei6wzs9': {
      'pt': 'SAP - Standart Array Pier',
      'en': 'SAP - Standard Array Pier',
      'es': 'SAP - Muelle de matriz estándar',
    },
    '69kmxxvp': {
      'pt': 'Comentário sobre a estaca',
      'en': 'Commentary on the stake',
      'es': 'Comentario sobre la hoguera',
    },
    'knvwo2ld': {
      'pt': 'Digite aqui',
      'en': 'Type here',
      'es': 'Escribe aquí',
    },
    'p4v1zlu7': {
      'pt': 'Cancelar',
      'en': 'Cancel',
      'es': 'Cancelar',
    },
    'fhypzstw': {
      'pt': 'Editar estaca',
      'en': 'Edit stake',
      'es': 'Editar participación',
    },
  },
  // modal_addLider
  {
    'l2v95nl1': {
      'pt':
          'Você deseja adicionar um novo cadastro ou selecionar dos cadastros existentes?',
      'en': 'Do you want to add a new record or select from existing records?',
      'es':
          '¿Desea agregar un nuevo registro o seleccionar entre registros existentes?',
    },
    'i2w9eb3p': {
      'pt': 'Selecionar',
      'en': 'Select',
      'es': 'Seleccionar',
    },
    'xemy2fnu': {
      'pt': 'Cadastrar novo',
      'en': 'Register new',
      'es': 'Registrar nuevo',
    },
  },
  // qrcode
  {
    'akgsg971': {
      'pt': 'Imprimir cracha',
      'en': 'Print badge',
      'es': 'Imprimir insignia',
    },
    'dxyagyzj': {
      'pt': 'Nome',
      'en': 'Name',
      'es': 'Nombre',
    },
    'p374wv0p': {
      'pt': 'Telefone',
      'en': 'Telephone',
      'es': 'Teléfono',
    },
    'wr2b7emz': {
      'pt': 'Email',
      'en': 'E-mail',
      'es': 'Correo electrónico',
    },
    'fu8qn5jh': {
      'pt': 'Cargo',
      'en': 'Position',
      'es': 'Posición',
    },
    't7iaybvw': {
      'pt': 'Tipo de Acesso',
      'en': 'Access Type',
      'es': 'Tipo de acceso',
    },
    'b2bnl0id': {
      'pt': 'Nivel de Acesso',
      'en': 'Access Level',
      'es': 'Nivel de acceso',
    },
  },
  // status_stakes
  {
    'alwor2nj': {
      'pt': 'Status das estacas',
      'en': 'Stake status',
      'es': 'Estado de la participación',
    },
    'pes6uotc': {
      'pt': 'Não Cravada',
      'en': 'Not Engraved',
      'es': 'No grabado',
    },
    'ii8lz56a': {
      'pt': 'Cravada com Sucesso',
      'en': 'Successfully Nailed',
      'es': 'Grabado con éxito',
    },
    '6mvw2ndo': {
      'pt': 'Cravada com problema mas sem impeditivo para montagem de módulos',
      'en':
          'The car has a problem, but it doesn\'t prevent the assembly of modules.',
      'es': 'El coche tiene un problema, pero no impide el montaje de módulos.',
    },
    '88ct3bup': {
      'pt': 'Problema que impede a montagem de módulos',
      'en': 'Problem preventing module assembly.',
      'es': 'Problema que impide el montaje del módulo.',
    },
    '9l1259w3': {
      'pt': 'Módulos montados',
      'en': 'Assembled modules',
      'es': 'Módulos ensamblados',
    },
  },
  // modal_import
  {
    'f6g05nld': {
      'pt': 'Importar Colaboradores',
      'en': 'Import Collaborators',
      'es': 'Importar colaboradores',
    },
    'cr9fn4n6': {
      'pt':
          'Importe seus colaboradores de forma rápida e prática. Use nossa planilha modelo para preencher as informações e faça o upload para adicionar todos os dados de uma só vez.',
      'en':
          'Import your employees quickly and easily. Use our template spreadsheet to fill in the information and upload it to add all the data at once.',
      'es':
          'Importa a tus empleados rápida y fácilmente. Usa nuestra plantilla de hoja de cálculo para completar la información y subirla para agregar todos los datos a la vez.',
    },
    'dp67yc60': {
      'pt': 'Upload de dados de colaboradores',
      'en': 'Upload employee data',
      'es': 'Subir datos de empleados',
    },
    'krvk4l5s': {
      'pt': 'dados.colaboradores.csv',
      'en': 'data.collaborators.csv',
      'es': 'datos.colaboradores.csv',
    },
    'z29ibjpj': {
      'pt': 'Cancelar',
      'en': 'Cancel',
      'es': 'Cancelar',
    },
    'kvs8wkxx': {
      'pt': 'Confirmar',
      'en': 'Confirm',
      'es': 'Confirmar',
    },
    '7os21f03': {
      'pt': 'Erro',
      'en': 'Error',
      'es': 'Error',
    },
  },
  // calendarioDiario
  {
    'z1uerbbc': {
      'pt': 'Cancelar',
      'en': 'Cancel',
      'es': 'Cancelar',
    },
    '1jcw6jth': {
      'pt': 'Ok',
      'en': 'OK',
      'es': 'DE ACUERDO',
    },
  },
  // comp_template_backlog
  {
    'q9lkbs20': {
      'pt': ' - ',
      'en': ' - ',
      'es': ' - ',
    },
    'bzdg4a9y': {
      'pt':
          'Título da Tarefa - Breve descrição em poucas linhas sobre o que é essa tarefa',
      'en':
          'Task Title - Brief description in a few lines of what this task is.',
      'es':
          'Título de la tarea: Breve descripción en pocas líneas de lo que es esta tarea.',
    },
    'pgq6jtbv': {
      'pt': 'Quantidade',
      'en': 'Amount',
      'es': 'Cantidad',
    },
    'lzs0oo9k': {
      'pt': 'Selecione o check',
      'en': 'Select the check',
      'es': 'Seleccione el cheque',
    },
  },
  // modal_add_backlog_manual
  {
    'mcoxz3at': {
      'pt':
          'Crie e edite uma nova tarefa, associando ela aos trackers, estacas, módulos ou outros no backlog.',
      'en':
          'Create and edit a new task, associating it with trackers, stakes, modules, or other elements in the backlog.',
      'es':
          'Cree y edite una nueva tarea, asociándola con rastreadores, apuestas, módulos u otros elementos en el backlog.',
    },
    '2sp53m1p': {
      'pt': 'Selecione para qual equipamento essa tarefa será destinada',
      'en': 'Select the device that will be used for this task.',
      'es': 'Seleccione el dispositivo que se utilizará para esta tarea.',
    },
    'rzbd01ku': {
      'pt': 'Descrição da tarefa',
      'en': 'Task description',
      'es': 'Descripción de la tarea',
    },
    '1xnckd4z': {
      'pt': 'Descreva brevemente essa tarefa',
      'en': 'Briefly describe this task.',
      'es': 'Describa brevemente esta tarea.',
    },
    'o60cvv9m': {
      'pt': 'Peso da tarefa',
      'en': 'Task weight',
      'es': 'Peso de la tarea',
    },
    'ja88ev5c': {
      'pt':
          'O peso da tarefa deve ser um multiplicador. Ex.: x0.1; x2.1 ou x3.5',
      'en': 'The task weight should be a multiplier. Ex.: x0.1; x2.1 or x3.5',
      'es':
          'El peso de la tarea debe ser un multiplicador. Ej.: x0,1; x2,1 o x3,5',
    },
    'bwjzojfm': {
      'pt': 'Unidade/Medida',
      'en': 'Unit/Measurement',
      'es': 'Unidad/Medida',
    },
    'fq749yur': {
      'pt': 'Selecione',
      'en': 'Select',
      'es': 'Seleccionar',
    },
    'xc18mpkp': {
      'pt': 'Search...',
      'en': 'Search...',
      'es': 'Buscar...',
    },
    '40q02ims': {
      'pt': '* Campo obrigatório',
      'en': '* Required field',
      'es': '* Campo obligatorio',
    },
    'jgtdxgcz': {
      'pt': 'Quantidade',
      'en': 'Amount',
      'es': 'Cantidad',
    },
    'zwpo18hb': {
      'pt': 'Digite a quantidade',
      'en': 'Enter the quantity',
      'es': 'Introduzca la cantidad',
    },
    '8027sdpc': {
      'pt': '* Campo obrigatório',
      'en': '* Required field',
      'es': '* Campo obligatorio',
    },
    'e2r4r6dm': {
      'pt': 'Disciplina',
      'en': 'Discipline',
      'es': 'Disciplina',
    },
    'flf4f16o': {
      'pt': 'Selecione',
      'en': 'Select',
      'es': 'Seleccionar',
    },
    '5jhdqv8o': {
      'pt': 'Search...',
      'en': 'Search...',
      'es': 'Buscar...',
    },
    'aavhs1h0': {
      'pt': '* Campo obrigatório',
      'en': '* Required field',
      'es': '* Campo obligatorio',
    },
    'vsjuev34': {
      'pt': 'Quantidade de tarefas a criar',
      'en': 'Number of tasks to create',
      'es': 'Número de tareas a crear',
    },
    'xxnsbtfr': {
      'pt': 'Digite a quantidade',
      'en': 'Enter the quantity',
      'es': 'Introduzca la cantidad',
    },
    'v0mgxns0': {
      'pt': '1',
      'en': '1',
      'es': '1',
    },
    'yzfl1xet': {
      'pt': 'Cancelar',
      'en': 'Cancel',
      'es': 'Cancelar',
    },
    '7h9i265v': {
      'pt': 'Salvar tarefa manualmente',
      'en': 'Save task manually',
      'es': 'Guardar la tarea manualmente',
    },
    'vovxkms5': {
      'pt': 'Adicionar tarefa ao backlog',
      'en': 'Add task to backlog',
      'es': 'Agregar tarea al backlog',
    },
    '90g6yiiu': {
      'pt':
          'Você tem certeza que deseja criar essa tarefas ao backlog automaticamente?',
      'en':
          'Are you sure you want to automatically add these tasks to your backlog?',
      'es':
          '¿Estás seguro de que deseas agregar automáticamente estas tareas a tu lista de tareas pendientes?',
    },
    'a38f6saq': {
      'pt': 'Erro',
      'en': 'Error',
      'es': 'Error',
    },
    'cml3hh39': {
      'pt': 'Erro',
      'en': 'Error',
      'es': 'Error',
    },
    'xwqriu73': {
      'pt': 'Campo obrigatório',
      'en': 'Required field',
      'es': 'Campo obligatorio',
    },
    'b8s73m77': {
      'pt': 'Please choose an option from the dropdown',
      'en': 'Please choose an option from the dropdown',
      'es': 'Por favor, elija una opción del menú desplegable.',
    },
    'vys1gh46': {
      'pt': 'Campo obrigatório',
      'en': 'Required field',
      'es': 'Campo obligatorio',
    },
    'hitd6u0b': {
      'pt': 'Please choose an option from the dropdown',
      'en': 'Please choose an option from the dropdown',
      'es': 'Por favor, elija una opción del menú desplegable.',
    },
    'n613h1y3': {
      'pt': 'Campo obrigatório',
      'en': 'Required field',
      'es': 'Campo obligatorio',
    },
    'mzz4ov18': {
      'pt': 'Please choose an option from the dropdown',
      'en': 'Please choose an option from the dropdown',
      'es': 'Por favor, elija una opción del menú desplegable.',
    },
    'xdhbrrmm': {
      'pt': '1 is required',
      'en': '1 is required',
      'es': '1 es requerido',
    },
    'fr8x4nr6': {
      'pt': 'Please choose an option from the dropdown',
      'en': 'Please choose an option from the dropdown',
      'es': 'Por favor, elija una opción del menú desplegable.',
    },
  },
  // modal_subtasks
  {
    'onjb6vcs': {
      'pt':
          'Crie e edite subtarefas para detalhar melhor o andamento da tarefa principal.',
      'en':
          'Create and edit subtasks to better detail the progress of the main task.',
      'es':
          'Cree y edite subtareas para detallar mejor el progreso de la tarea principal.',
    },
    'qhebzpwv': {
      'pt': 'Descrição da subtarefa',
      'en': 'Subtask description',
      'es': 'Descripción de la subtarea',
    },
    'vlvwnsht': {
      'pt': 'Descreva brevemente essa tarefa',
      'en': 'Briefly describe this task.',
      'es': 'Describa brevemente esta tarea.',
    },
    'dnrpbggy': {
      'pt': 'Peso da subtarefa',
      'en': 'Subtask weight',
      'es': 'Peso de la subtarea',
    },
    'zmr0lttb': {
      'pt':
          'O peso da tarefa deve ser um multiplicador. Ex.: x0.1; x2.1 ou x3.5',
      'en': 'The task weight should be a multiplier. Ex.: x0.1; x2.1 or x3.5',
      'es':
          'El peso de la tarea debe ser un multiplicador. Ej.: x0,1; x2,1 o x3,5',
    },
    'viyvjlhy': {
      'pt': '* Campo obrigatório',
      'en': '* Required field',
      'es': '* Campo obligatorio',
    },
    'qv7o9pmb': {
      'pt': 'Please choose an option from the dropdown',
      'en': 'Please choose an option from the dropdown',
      'es': 'Por favor, elija una opción del menú desplegable.',
    },
    'ahgu2q2j': {
      'pt': '* Campo obrigatório',
      'en': '* Required field',
      'es': '* Campo obligatorio',
    },
    'gvlcbx36': {
      'pt': 'Please choose an option from the dropdown',
      'en': 'Please choose an option from the dropdown',
      'es': 'Por favor, elija una opción del menú desplegable.',
    },
    'u2bl182s': {
      'pt': 'Quantidade',
      'en': 'Amount',
      'es': 'Cantidad',
    },
    'w8n8iuzj': {
      'pt': 'Digite a quantidade',
      'en': 'Enter the quantity',
      'es': 'Introduzca la cantidad',
    },
    '3st9k38j': {
      'pt': '* Campo obrigatório',
      'en': '* Required field',
      'es': '* Campo obligatorio',
    },
    'wuezta8q': {
      'pt': 'Quantidade de tarefas a criar',
      'en': 'Number of tasks to create',
      'es': 'Número de tareas a crear',
    },
    'vqosi6cr': {
      'pt': 'Digite a quantidade',
      'en': 'Enter the quantity',
      'es': 'Introduzca la cantidad',
    },
    'w2mfl5j1': {
      'pt': '1',
      'en': '1',
      'es': '1',
    },
    '58txs62s': {
      'pt': 'Total disponível: ',
      'en': 'Total available:',
      'es': 'Total disponible:',
    },
    'pk3mibkt': {
      'pt': ' + ',
      'en': '+',
      'es': '+',
    },
    'bqx0a8fq': {
      'pt': '* Não é possível criar uma quantidade maior do que a disponível',
      'en':
          '* It is not possible to create a quantity greater than what is available.',
      'es': '*No es posible crear una cantidad mayor a la disponible.',
    },
    'wi2qbcma': {
      'pt': 'Cancelar',
      'en': 'Cancel',
      'es': 'Cancelar',
    },
    '41ns3cga': {
      'pt': 'Salvar subtarefa manualmente',
      'en': 'Save subtasks manually',
      'es': 'Guardar subtareas manualmente',
    },
    'j0zqsud6': {
      'pt': 'Erro',
      'en': 'Error',
      'es': 'Error',
    },
    'm2ok4oyq': {
      'pt': 'Erro',
      'en': 'Error',
      'es': 'Error',
    },
  },
  // modal_add_estoque
  {
    '02ae6j5w': {
      'pt': 'Preencha os dados do produto para adicionar ou editar ao estoque.',
      'en': 'Fill in the product details to add or edit the inventory.',
      'es':
          'Complete los detalles del producto para agregar o editar el inventario.',
    },
    'q24vt029': {
      'pt': 'Nome do Produto',
      'en': 'Product Name',
      'es': 'Nombre del producto',
    },
    '5ezfcifa': {
      'pt': '',
      'en': '',
      'es': '',
    },
    'e9cg9ff3': {
      'pt': 'Ex: Painel Solar 550W',
      'en': 'Example: 550W Solar Panel',
      'es': 'Ejemplo: Panel solar de 550 W',
    },
    'brygvgre': {
      'pt': 'Categoria',
      'en': 'Category',
      'es': 'Categoría',
    },
    'd9ta6jfs': {
      'pt': 'Selecione uma categoria',
      'en': 'Select a category',
      'es': 'Seleccione una categoría',
    },
    'y2tuj5n4': {
      'pt': 'Search...',
      'en': 'Search...',
      'es': 'Buscar...',
    },
    'nlcl35yv': {
      'pt': '* Campo obrigatório',
      'en': '* Required field',
      'es': '* Campo obligatorio',
    },
    'dp9hslvj': {
      'pt': 'Fabricante',
      'en': 'Manufacturer',
      'es': 'Fabricante',
    },
    'a7j7ny47': {
      'pt': '(Selecione uma categoria)',
      'en': '(Select a category)',
      'es': '(Seleccione una categoría)',
    },
    'o38umocd': {
      'pt': '* Campo obrigatório',
      'en': '* Required field',
      'es': '* Campo obligatorio',
    },
    '9jojfzy3': {
      'pt': 'Unidade',
      'en': 'Unit',
      'es': 'Unidad',
    },
    'mudcz4uk': {
      'pt': 'Ex: un, kg, m',
      'en': 'Ex: unit, kg, m',
      'es': 'Ej: unidad, kg, m',
    },
    'kw8ajx2k': {
      'pt': 'Search...',
      'en': 'Search...',
      'es': 'Buscar...',
    },
    '95y89yy7': {
      'pt': '* Campo obrigatório',
      'en': '* Required field',
      'es': '* Campo obligatorio',
    },
    'umv1fwzp': {
      'pt': 'Estoque Mínimo',
      'en': 'Minimum Stock',
      'es': 'Stock mínimo',
    },
    'qw9rxecq': {
      'pt': '',
      'en': '',
      'es': '',
    },
    'lwtu9crd': {
      'pt': '0',
      'en': '0',
      'es': '0',
    },
    'q3t03f2u': {
      'pt': 'Estoque Atual',
      'en': 'Current Stock',
      'es': 'Stock actual',
    },
    'ncjocod6': {
      'pt': '',
      'en': '',
      'es': '',
    },
    'kxefmrrz': {
      'pt': '0',
      'en': '0',
      'es': '0',
    },
    'fuoqu9yk': {
      'pt': 'Especificações',
      'en': 'Specifications',
      'es': 'Presupuesto',
    },
    '5lvkv2ue': {
      'pt': '',
      'en': '',
      'es': '',
    },
    'ptpoehpw': {
      'pt': 'Descreva as especificações técnicas do produto...',
      'en': 'Describe the product\'s technical specifications...',
      'es': 'Describe las especificaciones técnicas del producto...',
    },
    'bldeovm3': {
      'pt': 'Salvar Produto',
      'en': 'Save Product',
      'es': 'Guardar producto',
    },
    'jby2zca6': {
      'pt': 'Erro',
      'en': 'Error',
      'es': 'Error',
    },
    'lwq19u2m': {
      'pt': 'Erro',
      'en': 'Error',
      'es': 'Error',
    },
    '6hnreg28': {
      'pt': '* Campo obrigatório',
      'en': '* Required field',
      'es': '* Campo obligatorio',
    },
    '1sb5njnp': {
      'pt': 'Please choose an option from the dropdown',
      'en': 'Please choose an option from the dropdown',
      'es': 'Por favor, elija una opción del menú desplegable.',
    },
    'ezps2044': {
      'pt': '* Campo obrigatório',
      'en': '* Required field',
      'es': '* Campo obligatorio',
    },
    'g4yr8g63': {
      'pt': 'Please choose an option from the dropdown',
      'en': 'Please choose an option from the dropdown',
      'es': 'Por favor, elija una opción del menú desplegable.',
    },
    'z6pwbv2s': {
      'pt': '* Campo obrigatório',
      'en': '* Required field',
      'es': '* Campo obligatorio',
    },
    'mus4831x': {
      'pt': 'Please choose an option from the dropdown',
      'en': 'Please choose an option from the dropdown',
      'es': 'Por favor, elija una opción del menú desplegable.',
    },
    '9kgo5phc': {
      'pt': '* Campo obrigatório',
      'en': '* Required field',
      'es': '* Campo obligatorio',
    },
    '7me6bo8k': {
      'pt': 'Please choose an option from the dropdown',
      'en': 'Please choose an option from the dropdown',
      'es': 'Por favor, elija una opción del menú desplegable.',
    },
  },
  // comp_projetos
  {
    'tg0ya0mg': {
      'pt': 'CNO:',
      'en': 'CNO:',
      'es': 'Jefe de Operaciones:',
    },
  },
  // options_estoque
  {
    'hs4twc7x': {
      'pt': 'Editar informações',
      'en': 'Edit information',
      'es': 'Editar información',
    },
    '1k5dtw3b': {
      'pt': 'Entrada Estoque',
      'en': 'Inventory Entry',
      'es': 'Entrada de inventario',
    },
    'ie56o2o6': {
      'pt': 'Saída Estoque',
      'en': 'Stock Output',
      'es': 'Salida de stock',
    },
    'jjs40jbe': {
      'pt': 'Remover',
      'en': 'Remove',
      'es': 'Eliminar',
    },
    'i6mangd7': {
      'pt': 'Esta ação removerá este item do estoque!',
      'en': 'This action will remove this item from inventory!',
      'es': '¡Esta acción eliminará este artículo del inventario!',
    },
    'mg4nvjqx': {
      'pt': 'Tem certeza que deseja remover esse item?',
      'en': 'Are you sure you want to remove this item?',
      'es': '¿Estás seguro que deseas eliminar este elemento?',
    },
    'ncrmzu3p': {
      'pt': 'Erro!',
      'en': 'Error!',
      'es': '¡Error!',
    },
  },
  // filtro_estoque_status
  {
    'gwqj8p29': {
      'pt': 'Filtrar por Status',
      'en': 'Filter by Status',
      'es': 'Filtrar por estado',
    },
    'n3ij67j8': {
      'pt': 'Aplicar filtro',
      'en': 'Apply filter',
      'es': 'Aplicar filtro',
    },
  },
  // modal_estoque_qtd
  {
    'slltrli9': {
      'pt': 'Quantidade do Produto',
      'en': 'Product Quantity',
      'es': 'Cantidad de producto',
    },
    'muhnoejx': {
      'pt': '',
      'en': '',
      'es': '',
    },
    'l5yuaxjc': {
      'pt': '0',
      'en': '0',
      'es': '0',
    },
    'szkl7rpg': {
      'pt': 'Retirado por',
      'en': 'Removed by',
      'es': 'Eliminado por',
    },
    'pjxux0on': {
      'pt': 'Selecione',
      'en': 'Select',
      'es': 'Seleccionar',
    },
    '2nt6cxz8': {
      'pt': 'Buscar por nome',
      'en': 'Search by name',
      'es': 'Buscar por nombre',
    },
    'xysryvyl': {
      'pt': '* Campo obrigatório',
      'en': '* Required field',
      'es': '* Campo obligatorio',
    },
    'nol3nw5n': {
      'pt': 'Salvar',
      'en': 'Save',
      'es': 'Ahorrar',
    },
    '3x1yidgy': {
      'pt': 'Erro',
      'en': 'Error',
      'es': 'Error',
    },
    'j63f7u3n': {
      'pt': 'Erro',
      'en': 'Error',
      'es': 'Error',
    },
  },
  // modal_inventory_logs
  {
    'b8g1mmao': {
      'pt': 'Histórico de Movimentações',
      'en': 'Transaction History',
      'es': 'Historial de transacciones',
    },
    '31k5v9wo': {
      'pt': 'Registro de todas as entradas e saídas de produtos no estoque',
      'en': 'Record of all product entries and exits in inventory.',
      'es':
          'Registro de todas las entradas y salidas de productos en inventario.',
    },
    'tz19s2j5': {
      'pt': 'Data',
      'en': 'Date',
      'es': 'Fecha',
    },
    'xgrgfand': {
      'pt': 'Tipo',
      'en': 'Type',
      'es': 'Tipo',
    },
    'nbvurpbn': {
      'pt': 'Código',
      'en': 'Code',
      'es': 'Código',
    },
    '2uenj9do': {
      'pt': 'Produto',
      'en': 'Product',
      'es': 'Producto',
    },
    '2cimfjyu': {
      'pt': 'Quantidade',
      'en': 'Amount',
      'es': 'Cantidad',
    },
    'rvk47wwj': {
      'pt': 'Responsável',
      'en': 'Responsible',
      'es': 'Responsable',
    },
    'd2ezd9qx': {
      'pt': 'Retirado por',
      'en': 'Removed by',
      'es': 'Eliminado por',
    },
    'cappnfa1': {
      'pt': 'Observações',
      'en': 'Observations',
      'es': 'Observaciones',
    },
    'ial8yul9': {
      'pt': 'linhas por página:',
      'en': 'lines per page:',
      'es': 'líneas por página:',
    },
    'y275za2b': {
      'pt': '10',
      'en': '10',
      'es': '10',
    },
    'p1yp05br': {
      'pt': 'Search...',
      'en': 'Search...',
      'es': 'Buscar...',
    },
    'bp9b5kd3': {
      'pt': '5',
      'en': '5',
      'es': '5',
    },
    'nrnfuymb': {
      'pt': '10',
      'en': '10',
      'es': '10',
    },
    'p4wr8kd0': {
      'pt': '15',
      'en': '15',
      'es': '15',
    },
    'faywabrg': {
      'pt': '20',
      'en': '20',
      'es': '20',
    },
    'sxret3cp': {
      'pt': '50',
      'en': '50',
      'es': '50',
    },
    'p4bgllp0': {
      'pt': '100',
      'en': '100',
      'es': '100',
    },
  },
  // modal_file
  {
    'tk8dvgew': {
      'pt': 'Escolha o formato de exportação:',
      'en': 'Choose the export format:',
      'es': 'Elija el formato de exportación:',
    },
    '22uf1yf7': {
      'pt': 'CSV - Para planilhas e análises',
      'en': 'CSV - For spreadsheets and analysis',
      'es': 'CSV - Para hojas de cálculo y análisis',
    },
    'bt5nh79d': {
      'pt': 'CSV - Para planilhas e análises',
      'en': 'CSV - For spreadsheets and analysis',
      'es': 'CSV - Para hojas de cálculo y análisis',
    },
    'g91u2k98': {
      'pt': 'PDF - Para impressão e relatórios',
      'en': 'PDF - For printing and reports',
      'es': 'PDF - Para impresión e informes',
    },
    'gf14h2u4': {
      'pt': 'Escolha o formato de exportação:',
      'en': 'Choose the export format:',
      'es': 'Elija el formato de exportación:',
    },
    'cfpq3iaj': {
      'pt':
          '- Todos os produtos cadastrados\n- Informações de estoque e preços\n- Especificações técnicas\n- Histórico de movimentações',
      'en':
          '- All registered products\n\n- Stock and price information\n\n- Technical specifications\n- Transaction history',
      'es':
          '- Todos los productos registrados\n\n- Información de stock y precios\n\n- Especificaciones técnicas\n- Historial de transacciones',
    },
    'j942cn7c': {
      'pt': 'Escolha o formato de exportação:',
      'en': 'Choose the export format:',
      'es': 'Elija el formato de exportación:',
    },
    '39upw9ou': {
      'pt': '- CSV (.csv)',
      'en': 'CSV (.csv)',
      'es': 'CSV (.csv)',
    },
    'o3vvgbh5': {
      'pt': 'Escolha o formato de exportação:',
      'en': 'Choose the export format:',
      'es': 'Elija el formato de exportación:',
    },
    'dyk5zkaz': {
      'pt':
          '- Produto\n- Fabricante\n- Unidade\n- Estoque Atual\n- Estoque minimo\n- Especificações',
      'en':
          '- Product\n- Manufacturer\n- Unit\n- Current Stock\n- Minimum Stock\n- Specifications',
      'es':
          '- Producto\n- Fabricante\n- Unidad\n- Stock actual\n- Stock mínimo\n- Especificaciones',
    },
    'hlnbur9s': {
      'pt':
          '📊 O arquivo será gerado com os dados atualizados do momento da exportação.',
      'en':
          '📊 The file will be generated with the updated data from the time of export.',
      'es':
          '📊El archivo se generará con los datos actualizados al momento de la exportación.',
    },
    'q3fg1bsy': {
      'pt':
          '💡 Certifique-se de que seu arquivo está formatado corretamente antes de importar para evitar erros.',
      'en':
          '💡 Make sure your file is formatted correctly before importing to avoid errors.',
      'es':
          '💡Asegúrese de que su archivo esté formateado correctamente antes de importarlo para evitar errores.',
    },
    'fpw246ft': {
      'pt': 'Cancelar',
      'en': 'Cancel',
      'es': 'Cancelar',
    },
    'qo5ifelo': {
      'pt': 'Exportar Agora',
      'en': 'Export Now',
      'es': 'Exportar ahora',
    },
    'b4cjrfxq': {
      'pt': 'Erro',
      'en': 'Error',
      'es': 'Error',
    },
    '6wweg3y7': {
      'pt': 'Selecionar Arquivo',
      'en': 'Select File',
      'es': 'Seleccionar archivo',
    },
  },
  // filtro_estoque_category
  {
    'shfyq9hb': {
      'pt': 'Filtrar por Status',
      'en': 'Filter by Status',
      'es': 'Filtrar por estado',
    },
    'goaww22z': {
      'pt': 'Aplicar filtro',
      'en': 'Apply filter',
      'es': 'Aplicar filtro',
    },
  },
  // modal_detalhe_tarefa_sprint
  {
    'n038akcz': {
      'pt': 'Detalhe da tarefa',
      'en': 'Task details',
      'es': 'Detalles de la tarea',
    },
    'pgtsu3qs': {
      'pt':
          'Visualize suas tarefas e subtarefas, gerencie cada etapa com facilidade e acompanhe todos os comentários em um só lugar.',
      'en':
          'Visualize your tasks and subtasks, easily manage each step, and track all comments in one place.',
      'es':
          'Visualice sus tareas y subtareas, administre fácilmente cada paso y realice un seguimiento de todos los comentarios en un solo lugar.',
    },
    'v9fvpeip': {
      'pt': 'Sobre a tarefa',
      'en': 'About the task',
      'es': 'Acerca de la tarea',
    },
    '5of4fn57': {
      'pt': 'Discipline: ',
      'en': 'Discipline: ',
      'es': 'Disciplina: ',
    },
    'faw3acxy': {
      'pt': 'Quantidade da tarefa',
      'en': 'Task quantity',
      'es': 'Cantidad de tareas',
    },
    'ripm12m2': {
      'pt': 'Qtd da tarefa: ',
      'en': 'Task quantity: ',
      'es': 'Cantidad de tareas: ',
    },
    'yap100y5': {
      'pt': ' ',
      'en': '',
      'es': '',
    },
    'n3s0j8nc': {
      'pt': 'Quantidade da tarefa',
      'en': 'Task quantity',
      'es': 'Cantidad de tareas',
    },
    'go6zfw08': {
      'pt': 'Qtd executada: ',
      'en': 'Quantity executed: ',
      'es': 'Cantidad ejecutada: ',
    },
    'lou538zf': {
      'pt': ' ',
      'en': '',
      'es': '',
    },
    'n3f6298g': {
      'pt': 'Quantidade da tarefa',
      'en': 'Task quantity',
      'es': 'Cantidad de tareas',
    },
    'e627q1vm': {
      'pt': ' - ',
      'en': ' - ',
      'es': ' - ',
    },
    '814jqosl': {
      'pt': ' funcionário',
      'en': ' employee',
      'es': ' empleado',
    },
    'gn0o7hiz': {
      'pt': 'Campo ',
      'en': 'Field ',
      'es': 'Campo ',
    },
    '6sfvozcy': {
      'pt': 'Seção ',
      'en': 'Section ',
      'es': 'Sección ',
    },
    'bjbisrae': {
      'pt': 'Fileira ',
      'en': 'Row ',
      'es': 'Fila ',
    },
    '2z2k1258': {
      'pt': 'Tracker ',
      'en': 'Tracker ',
      'es': 'Rastreador ',
    },
    'beah21c5': {
      'pt': 'Estaca ',
      'en': 'Stake ',
      'es': 'Apostar ',
    },
    'wqf3c7jk': {
      'pt': 'Criar subtarefa',
      'en': 'Create subtask',
      'es': 'Crear subtarea',
    },
    'tsqjps1w': {
      'pt': 'Excluir tarefa',
      'en': 'Delete task',
      'es': 'Eliminar tarea',
    },
    'n5m3wwii': {
      'pt': 'Deletetar Tarefa',
      'en': 'Delete Task',
      'es': 'Eliminar tarea',
    },
    'lt01mmtf': {
      'pt':
          'Tem certeza que deseja remover essa tarefa? Você perderá todos os registros dela.',
      'en':
          'Are you sure you want to remove this task? You will lose all records of it.',
      'es':
          '¿Seguro que desea eliminar esta tarea? Perderá todos sus registros.',
    },
    '07zmy8bc': {
      'pt': 'Erro',
      'en': 'Error',
      'es': 'Error',
    },
    '83f1flzg': {
      'pt': 'Subtarefas',
      'en': 'Subtasks',
      'es': 'Subtareas',
    },
    'opt6owbx': {
      'pt': 'Informações da subtarefa',
      'en': 'Subtask information',
      'es': 'Información de subtareas',
    },
    'hlxxlgvj': {
      'pt': 'Comentarios da tarefa',
      'en': 'Task comments',
      'es': 'Comentarios de la tarea',
    },
    'unmd3wqi': {
      'pt': 'Titulo: ',
      'en': 'Title: ',
      'es': 'Título: ',
    },
    'vkatss5u': {
      'pt': 'Titulo: Cravação de estaca',
      'en': 'Title: Pile Driving',
      'es': 'Título: Hinca de pilotes',
    },
    'in7h6hws': {
      'pt': 'Criado por: ',
      'en': 'Created by: ',
      'es': 'Creado por: ',
    },
    'd0rf89pt': {
      'pt': 'Titulo: Cravação de estaca',
      'en': 'Title: Pile Driving',
      'es': 'Título: Hinca de pilotes',
    },
    'yycxglko': {
      'pt': 'Data: ',
      'en': 'Date: ',
      'es': 'Fecha: ',
    },
    'wo1dgf9d': {
      'pt': 'Titulo: Cravação de estaca',
      'en': 'Title: Pile Driving',
      'es': 'Título: Hinca de pilotes',
    },
    '28detnbm': {
      'pt': 'Comentario',
      'en': 'Comment',
      'es': 'Comentario',
    },
    'etj3r8r3': {
      'pt': 'Comentarios da tarefa',
      'en': 'Task comments',
      'es': 'Comentarios de la tarea',
    },
    '1q66am53': {
      'pt': 'Criado por: ',
      'en': 'Created by: ',
      'es': 'Creado por: ',
    },
    'nk0vdbym': {
      'pt': 'Titulo: Cravação de estaca',
      'en': 'Title: Pile Driving',
      'es': 'Título: Hinca de pilotes',
    },
    '7w2ww1ki': {
      'pt': 'Data: ',
      'en': 'Date: ',
      'es': 'Fecha: ',
    },
    'hs0uyssc': {
      'pt': 'Titulo: Cravação de estaca',
      'en': 'Title: Pile Driving',
      'es': 'Título: Hinca de pilotes',
    },
    'z4ltyn7q': {
      'pt': 'Comentario',
      'en': 'Comment ',
      'es': 'Comentario ',
    },
    'xqouzyav': {
      'pt': 'Descrição da subtarefa',
      'en': 'Subtask description',
      'es': 'Descripción de la subtarea',
    },
    's3m8jind': {
      'pt': 'Descreva brevemente essa tarefa',
      'en': 'Briefly describe this task.',
      'es': 'Describa brevemente esta tarea.',
    },
    'kti8xvca': {
      'pt': 'Peso da subtarefa',
      'en': 'Subtask weight',
      'es': 'Peso de la subtarea',
    },
    'gp4naqa0': {
      'pt':
          'O peso da tarefa deve ser um multiplicador. Ex.: x0.1; x2.1 ou x3.5',
      'en': 'The task weight should be a multiplier. Ex.: x0.1; x2.1 or x3.5',
      'es':
          'El peso de la tarea debe ser un multiplicador. Ej.: x0,1; x2,1 o x3,5',
    },
    'p04p93k5': {
      'pt': '1',
      'en': '1',
      'es': '1',
    },
    'hfvmlg6r': {
      'pt': '* Campo obrigatório',
      'en': '* Required field',
      'es': '* Campo obligatorio',
    },
    'vpxhoz1f': {
      'pt': 'Please choose an option from the dropdown',
      'en': 'Please choose an option from the dropdown',
      'es': 'Por favor, elija una opción del menú desplegable.',
    },
    '4fhitiez': {
      'pt': '* Campo obrigatório',
      'en': '* Required field',
      'es': '* Campo obligatorio',
    },
    '70o8gzqx': {
      'pt': 'Please choose an option from the dropdown',
      'en': 'Please choose an option from the dropdown',
      'es': 'Por favor, elija una opción del menú desplegable.',
    },
    'y6p9kf09': {
      'pt': 'Quantidade',
      'en': 'Amount',
      'es': 'Cantidad',
    },
    '7w23ys9b': {
      'pt': 'Digite a quantidade',
      'en': 'Enter the quantity',
      'es': 'Introduzca la cantidad',
    },
    'w8v2s43h': {
      'pt': '* Campo obrigatório',
      'en': '* Required field',
      'es': '* Campo obligatorio',
    },
    'vtmyps55': {
      'pt': 'Quantidade de tarefas a criar',
      'en': 'Number of tasks to create',
      'es': 'Número de tareas a crear',
    },
    '8we3lra1': {
      'pt': 'Digite a quantidade',
      'en': 'Enter the quantity',
      'es': 'Introduzca la cantidad',
    },
    'r9htqgyc': {
      'pt': '1',
      'en': '1',
      'es': '1',
    },
    'j8hp2g09': {
      'pt': 'Cancelar',
      'en': 'Cancel',
      'es': 'Cancelar',
    },
    'y8ouloom': {
      'pt': 'Salvar subtarefa',
      'en': 'Save subtask',
      'es': 'Guardar subtarea',
    },
    'bbhkwo5j': {
      'pt': 'Erro',
      'en': 'Error',
      'es': 'Error',
    },
    'q7utvdtf': {
      'pt': 'Erro',
      'en': 'Error',
      'es': 'Error',
    },
    'es9xvw81': {
      'pt': 'Erro',
      'en': 'Error',
      'es': 'Error',
    },
    'vzwc4obg': {
      'pt': 'Comentario(s) da subtarefa',
      'en': 'Subtask comment(s)',
      'es': 'Comentarios de la subtarea',
    },
    'nlreq1ok': {
      'pt': 'Veja aqui todos os comentários relacionados a esta subtarefa.',
      'en': 'See all comments related to this subtask here.',
      'es': 'Vea todos los comentarios relacionados con esta subtarea aquí.',
    },
    '2emrcmep': {
      'pt': 'Titulo: ',
      'en': 'Title: ',
      'es': 'Título: ',
    },
    'f7nn18c7': {
      'pt': 'Titulo: Cravação de estaca',
      'en': 'Title: Pile Driving',
      'es': 'Título: Hinca de pilotes',
    },
    's9nx880o': {
      'pt': 'Criado por: ',
      'en': 'Created by: ',
      'es': 'Creado por: ',
    },
    'g824a1ya': {
      'pt': 'Titulo: Cravação de estaca',
      'en': 'Title: Pile Driving',
      'es': 'Título: Hinca de pilotes',
    },
    'q1v741xj': {
      'pt': 'Data: ',
      'en': 'Date: ',
      'es': 'Fecha: ',
    },
    '4bazam64': {
      'pt': 'Titulo: Cravação de estaca',
      'en': 'Title: Pile Driving',
      'es': 'Título: Hinca de pilotes',
    },
    '9rh5v6ur': {
      'pt': 'Comentario',
      'en': 'Comment',
      'es': 'Comentario',
    },
    'qwvon9kb': {
      'pt': 'Erro',
      'en': 'Error',
      'es': 'Error',
    },
  },
  // modal_Company
  {
    'edt4lf2q': {
      'pt': 'Dados da Empresa',
      'en': 'Company Data',
      'es': 'Datos de la empresa',
    },
    '68u8v30v': {
      'pt':
          'Acompanhe todas as informações da sua empresa em um só lugar e edite qualquer detalhe quando quiser.',
      'en':
          'Keep track of all your company information in one place and edit any detail whenever you want.',
      'es':
          'Mantenga un registro de toda la información de su empresa en un solo lugar y edite cualquier detalle cuando lo desee.',
    },
    '259vod2t': {
      'pt': 'Nome Fantasia',
      'en': 'Trade Name',
      'es': 'Nombre comercial',
    },
    'srvbn6hn': {
      'pt': '',
      'en': '',
      'es': '',
    },
    'xp4jd745': {
      'pt': 'Ex: IndustriView',
      'en': 'Example: IndustriView',
      'es': 'Ejemplo: IndustriView',
    },
    '3rxvjohl': {
      'pt': 'Razão Social',
      'en': 'Company Name',
      'es': 'nombre de empresa',
    },
    'vcwunmgk': {
      'pt': '',
      'en': '',
      'es': '',
    },
    '8klah4ae': {
      'pt': 'Ex: IndustriView',
      'en': 'Example: IndustriView',
      'es': 'Ejemplo: IndustriView',
    },
    '5yycnmw8': {
      'pt': 'CNPJ',
      'en': 'CNPJ',
      'es': 'CNPJ',
    },
    'fquuq9vd': {
      'pt': '',
      'en': '',
      'es': '',
    },
    'zyi16oht': {
      'pt': '12.345.678/9101-23',
      'en': '12.345.678/9101-23',
      'es': '12.345.678/9101-23',
    },
    'xbllc2kh': {
      'pt': 'Telefone da Empresa',
      'en': 'Company Phone Number',
      'es': 'Número de teléfono de la empresa',
    },
    'wb58gf9i': {
      'pt': '',
      'en': '',
      'es': '',
    },
    'g7n7eru9': {
      'pt': '(12) 3 4567-8910',
      'en': '(12) 3 4567-8910',
      'es': '(12) 3 4567-8910',
    },
    'xnferjiw': {
      'pt': 'Email da Empresa',
      'en': 'Company Email',
      'es': 'Correo electrónico de la empresa',
    },
    'hsxkclsh': {
      'pt': '',
      'en': '',
      'es': '',
    },
    'xfnr61e3': {
      'pt': 'seu@email.com',
      'en': 'your@email.com',
      'es': 'tu@correoelectrónico.com',
    },
    'dexwebn0': {
      'pt': 'CEP',
      'en': 'ZIP code',
      'es': 'Código postal',
    },
    'curaamk8': {
      'pt': '',
      'en': '',
      'es': '',
    },
    'u51mdx8h': {
      'pt': 'Ex: 12345-678',
      'en': 'Ex: 12345-678',
      'es': 'Ej: 12345-678',
    },
    'sfoyscvp': {
      'pt': 'Número',
      'en': 'Number',
      'es': 'Número',
    },
    'yzyvqyff': {
      'pt': '',
      'en': '',
      'es': '',
    },
    'calrc4wy': {
      'pt': 'Ex: 88',
      'en': 'Ex: 88',
      'es': 'Ej: 88',
    },
    'qs5twist': {
      'pt': 'Logradouro',
      'en': 'Street',
      'es': 'Calle',
    },
    'dvxrpwg5': {
      'pt': '',
      'en': '',
      'es': '',
    },
    'pac6y4hp': {
      'pt': 'Ex: Avenida Paulista',
      'en': 'Example: Paulista Avenue',
      'es': 'Ejemplo: Avenida Paulista',
    },
    'q6ecy78z': {
      'pt': 'Cidade',
      'en': 'City',
      'es': 'Ciudad',
    },
    '2q2sgwoo': {
      'pt': '',
      'en': '',
      'es': '',
    },
    'ypuiqm3n': {
      'pt': 'Ex: São paulo',
      'en': 'Example: São Paulo',
      'es': 'Ejemplo: São Paulo',
    },
    'v5awi7qy': {
      'pt': 'UF',
      'en': 'UF',
      'es': 'UF',
    },
    'js96ehvq': {
      'pt': '',
      'en': '',
      'es': '',
    },
    'fx98en1s': {
      'pt': 'Ex: SP',
      'en': 'Ex: SP',
      'es': 'Ej: SP',
    },
    'ja4pkp4m': {
      'pt': 'Complemento',
      'en': 'Supplement',
      'es': 'Suplemento',
    },
    'ttbpgkav': {
      'pt': '',
      'en': '',
      'es': '',
    },
    '4oqkmer5': {
      'pt': 'Ex: Prédio de Esquida',
      'en': 'Example: Corner Building',
      'es': 'Ejemplo: Edificio de esquina',
    },
    '55osiyve': {
      'pt': 'Salvar',
      'en': 'Save',
      'es': 'Ahorrar',
    },
    'b8diao99': {
      'pt': 'Erro',
      'en': 'Error',
      'es': 'Error',
    },
    'wxr0x9cr': {
      'pt': '* Campo obrigatório',
      'en': '* Required field',
      'es': '* Campo obligatorio',
    },
    'eynocpzf': {
      'pt': 'Please choose an option from the dropdown',
      'en': 'Please choose an option from the dropdown',
      'es': 'Por favor, elija una opción del menú desplegable.',
    },
    'yqnrpysu': {
      'pt': '* Campo obrigatório',
      'en': '* Required field',
      'es': '* Campo obligatorio',
    },
    'sf6ea9p4': {
      'pt': 'Please choose an option from the dropdown',
      'en': 'Please choose an option from the dropdown',
      'es': 'Por favor, elija una opción del menú desplegable.',
    },
    '3f0s8k5u': {
      'pt': '* Campo obrigatório',
      'en': '* Required field',
      'es': '* Campo obligatorio',
    },
    '1ibyjbe3': {
      'pt': 'Please choose an option from the dropdown',
      'en': 'Please choose an option from the dropdown',
      'es': 'Por favor, elija una opción del menú desplegable.',
    },
    'rarjdaba': {
      'pt': '* Campo obrigatório',
      'en': '* Required field',
      'es': '* Campo obligatorio',
    },
    '9q9p8abj': {
      'pt': 'Please choose an option from the dropdown',
      'en': 'Please choose an option from the dropdown',
      'es': 'Por favor, elija una opción del menú desplegable.',
    },
    'jo3dlxew': {
      'pt': '* Campo obrigatório',
      'en': '* Required field',
      'es': '* Campo obligatorio',
    },
    'gj7a0kqp': {
      'pt': 'Please choose an option from the dropdown',
      'en': 'Please choose an option from the dropdown',
      'es': 'Por favor, elija una opción del menú desplegable.',
    },
    'ai6tyfnh': {
      'pt': '* Campo obrigatório',
      'en': '* Required field',
      'es': '* Campo obligatorio',
    },
    'x1odxmud': {
      'pt': 'Please choose an option from the dropdown',
      'en': 'Please choose an option from the dropdown',
      'es': 'Por favor, elija una opción del menú desplegable.',
    },
    'h0ssusuz': {
      'pt': '* Campo obrigatório',
      'en': '* Required field',
      'es': '* Campo obligatorio',
    },
    'luu71ro2': {
      'pt': 'Please choose an option from the dropdown',
      'en': 'Please choose an option from the dropdown',
      'es': 'Por favor, elija una opción del menú desplegable.',
    },
    '7dj4qlky': {
      'pt': '* Campo obrigatório',
      'en': '* Required field',
      'es': '* Campo obligatorio',
    },
    'mvkn9et7': {
      'pt': 'Please choose an option from the dropdown',
      'en': 'Please choose an option from the dropdown',
      'es': 'Por favor, elija una opción del menú desplegable.',
    },
    'f7glsfpa': {
      'pt': '* Campo obrigatório',
      'en': '* Required field',
      'es': '* Campo obligatorio',
    },
    '5zm2w17q': {
      'pt': 'Please choose an option from the dropdown',
      'en': 'Please choose an option from the dropdown',
      'es': 'Por favor, elija una opción del menú desplegable.',
    },
    'pyscnhjp': {
      'pt': '* Campo obrigatório',
      'en': '* Required field',
      'es': '* Campo obligatorio',
    },
    '42jnn3ws': {
      'pt': 'Please choose an option from the dropdown',
      'en': 'Please choose an option from the dropdown',
      'es': 'Por favor, elija una opción del menú desplegable.',
    },
    'a82yn88u': {
      'pt': 'Ex: Prédio de Esquida is required',
      'en': 'Ex: Corner Building is required',
      'es': 'Ej: Se requiere edificio de esquina',
    },
    'b9y0cldn': {
      'pt': 'Please choose an option from the dropdown',
      'en': 'Please choose an option from the dropdown',
      'es': 'Por favor, elija una opción del menú desplegable.',
    },
  },
  // modal_Equip
  {
    '5tzqojfw': {
      'pt': 'Cancelar',
      'en': 'Cancel',
      'es': 'Cancelar',
    },
    'hyj6mpy6': {
      'pt': 'Ir para gestão de equipes',
      'en': 'Go to team management',
      'es': 'Ir a gestión de equipos',
    },
  },
  // csv_comp
  {
    'pvufwpxh': {
      'pt': '1',
      'en': '',
      'es': '',
    },
    'tuiyc58c': {
      'pt': 'Selecionar comparação',
      'en': '',
      'es': '',
    },
    'zxrmaxj0': {
      'pt': 'Search...',
      'en': '',
      'es': '',
    },
    '5npjwoqk': {
      'pt': 'Selecionar comparação',
      'en': '',
      'es': '',
    },
    'cd00mmdp': {
      'pt': 'Search...',
      'en': '',
      'es': '',
    },
    'etcpoliz': {
      'pt': 'Renan Cesar dos Santos',
      'en': '',
      'es': '',
    },
    'ey957ugi': {
      'pt': 'Samantha maia',
      'en': '',
      'es': '',
    },
    'wl52zlyq': {
      'pt': 'Vitor',
      'en': '',
      'es': '',
    },
  },
  // Miscellaneous
  {
    'ivx2nb0x': {
      'pt': '',
      'en': '',
      'es': '',
    },
    '7tyklb53': {
      'pt': '',
      'en': '',
      'es': '',
    },
    '5uoz7w8k': {
      'pt': '',
      'en': '',
      'es': '',
    },
    'ipdoyrb1': {
      'pt': '',
      'en': '',
      'es': '',
    },
    'gggsv360': {
      'pt': '',
      'en': '',
      'es': '',
    },
    'nx3u7wqk': {
      'pt': '',
      'en': '',
      'es': '',
    },
    '28env4c8': {
      'pt': '',
      'en': '',
      'es': '',
    },
    'jw8sag61': {
      'pt': '',
      'en': '',
      'es': '',
    },
    'siv8idsc': {
      'pt': '',
      'en': '',
      'es': '',
    },
    'wo17kqfu': {
      'pt': '',
      'en': '',
      'es': '',
    },
    'nemwvb29': {
      'pt': '',
      'en': '',
      'es': '',
    },
    'lar0j7vt': {
      'pt': '',
      'en': '',
      'es': '',
    },
    'f25yr4hw': {
      'pt': '',
      'en': '',
      'es': '',
    },
    'q02moep8': {
      'pt': '',
      'en': '',
      'es': '',
    },
    'ryllgvyz': {
      'pt': '',
      'en': '',
      'es': '',
    },
    '8gvnlsdv': {
      'pt': '',
      'en': '',
      'es': '',
    },
    'mqnw64ec': {
      'pt': '',
      'en': '',
      'es': '',
    },
    '1hespvmd': {
      'pt': '',
      'en': '',
      'es': '',
    },
    'jgdvhka8': {
      'pt': '',
      'en': '',
      'es': '',
    },
    'rr998ws2': {
      'pt': '',
      'en': '',
      'es': '',
    },
    'u78oy41i': {
      'pt': '',
      'en': '',
      'es': '',
    },
    'kdqyxbfe': {
      'pt': '',
      'en': '',
      'es': '',
    },
    '3sbu882j': {
      'pt': '',
      'en': '',
      'es': '',
    },
    '6qoirmyc': {
      'pt': '',
      'en': '',
      'es': '',
    },
    'q1a9u2t0': {
      'pt': '',
      'en': '',
      'es': '',
    },
    '1b8y0u42': {
      'pt': '',
      'en': '',
      'es': '',
    },
    'k4k7s11p': {
      'pt': '',
      'en': '',
      'es': '',
    },
    'h6u9ico6': {
      'pt': 'Cadastrar novo funcionário',
      'en': 'Register new employee',
      'es': 'Registrar nuevo empleado',
    },
  },
].reduce((a, b) => a..addAll(b));

