import 'package:flutter/cupertino.dart';
import 'package:flutter/material.dart';
import 'package:flutter/foundation.dart';
import 'package:shared_preferences/shared_preferences.dart';

const _kLocaleStorageKey = '__locale_key__';

class AppLocalizations {
  AppLocalizations(this.locale);

  final Locale locale;

  static AppLocalizations of(BuildContext context) =>
      Localizations.of<AppLocalizations>(context, AppLocalizations)!;

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

class AppLocalizationsDelegate extends LocalizationsDelegate<AppLocalizations> {
  const AppLocalizationsDelegate();

  @override
  bool isSupported(Locale locale) => _isSupportedLocale(locale);

  @override
  Future<AppLocalizations> load(Locale locale) =>
      SynchronousFuture<AppLocalizations>(AppLocalizations(locale));

  @override
  bool shouldReload(AppLocalizationsDelegate old) => false;
}

Locale createLocale(String language) => language.contains('_')
    ? Locale.fromSubtags(
        languageCode: language.split('_').first,
        scriptCode: language.split('_').last,
      )
    : Locale(language);

bool _isSupportedLocale(Locale locale) {
  final language = locale.toString();
  return AppLocalizations.languages().contains(
    language.endsWith('_')
        ? language.substring(0, language.length - 1)
        : language,
  );
}

final kTranslationsMap = <Map<String, Map<String, String>>>[
  // Login
  {
    'lx7o6elx': {
      'pt': 'Bem-vindo!',
      'en': 'Welcome!',
      'es': '¡Bienvenido!',
    },
    '3cbe7wnu': {
      'pt': 'Faça seu login na plataforma para acessar o painel.',
      'en': 'Log in to the platform to access the dashboard.',
      'es': 'Inicie sesión en la plataforma para acceder al panel de control.',
    },
    'c1xdwbed': {
      'pt': 'Email',
      'en': 'E-mail',
      'es': 'Correo electrónico',
    },
    'kirg2ays': {
      'pt': 'Senha',
      'en': 'Password',
      'es': 'Contraseña',
    },
    '5hk3a0gv': {
      'pt': 'Esqueci minha senha',
      'en': 'I forgot my password.',
      'es': 'Olvidé mi contraseña.',
    },
    'xhugv4p6': {
      'pt': 'Fazer Login',
      'en': 'Log in',
      'es': 'Acceso',
    },
    'iwfkhl1s': {
      'pt': 'Erro',
      'en': 'Error',
      'es': 'Error',
    },
    '7ccdas4q': {
      'pt': 'Você está sem conexão com a internet',
      'en': 'You have no internet connection.',
      'es': 'No tienes conexión a Internet.',
    },
    '8hwqpseo': {
      'pt': 'Erro',
      'en': 'Error',
      'es': 'Error',
    },
    'i9a5uiw7': {
      'pt': 'Erro',
      'en': 'Error',
      'es': 'Error',
    },
    'au2xr1nb': {
      'pt':
          'Esté usuário não tem acesso a um projeto ou não é lider de uma equipe.',
      'en':
          'This user does not have access to a project or is not a team leader.',
      'es':
          'Este usuario no tiene acceso a un proyecto o no es líder de equipo.',
    },
    '602c6ku5': {
      'pt': 'O e-mail é obrigatório',
      'en': 'Email is required.',
      'es': 'Se requiere correo electrónico.',
    },
    'h600wd96': {
      'pt': 'Please choose an option from the dropdown',
      'en': 'Please choose an option from the dropdown',
      'es': 'Por favor, elija una opción del menú desplegable.',
    },
    'klavozuq': {
      'pt': 'A senhal é obrigatório',
      'en': 'A password is required.',
      'es': 'Se requiere una contraseña.',
    },
    'zoisz8yl': {
      'pt': 'Please choose an option from the dropdown',
      'en': 'Please choose an option from the dropdown',
      'es': 'Por favor, elija una opción del menú desplegable.',
    },
    'y0p0skni': {
      'pt': 'Home',
      'en': 'Home',
      'es': 'Hogar',
    },
  },
  // HomePage-Tarefas
  {
    '5tht4dc1': {
      'pt': 'Tarefas da sprint',
      'en': 'Sprint tasks',
      'es': 'Tareas de sprint',
    },
    '8997bn6w': {
      'pt': 'Filtros',
      'en': 'Filters',
      'es': 'Filtros',
    },
    'ttsaqd5y': {
      'pt': 'Procurar por código ou descrição da tarefa',
      'en': 'Search by code or task description',
      'es': 'Buscar por código o descripción de tarea',
    },
    'v6hqewoj': {
      'pt': 'Equipamento',
      'en': 'Equipment',
      'es': 'Equipo',
    },
    'kiq9cm2n': {
      'pt': 'Search...',
      'en': 'Search...',
      'es': 'Buscar...',
    },
    'ln1ovg5a': {
      'pt': 'Tarefa \"Sem sucesso\"',
      'en': 'Task \"Unsuccessful\"',
      'es': 'Tarea \"Fallida\"',
    },
    '1zi762pp': {
      'pt': 'Selecionar todas as tarefas filtradas',
      'en': 'Select all filtered tasks',
      'es': 'Seleccionar todas las tareas filtradas',
    },
    'fv19kacg': {
      'pt': 'Selecionar todas as tarefas filtradas',
      'en': 'Select all filtered tasks',
      'es': 'Seleccionar todas las tareas filtradas',
    },
    'pv86xn2h': {
      'pt': 'Tarefas',
      'en': 'Tasks',
      'es': 'Tareas',
    },
    'oecbnf5u': {
      'pt': ' ',
      'en': ' ',
      'es': ' ',
    },
    '46cwo2vc': {
      'pt':
          'Título da Tarefa - Breve descrição em poucas linhas sobre o que é essa tarefa',
      'en':
          'Task Title - Brief description in a few lines of what this task is.',
      'es':
          'Título de la tarea: Breve descripción en pocas líneas de lo que es esta tarea.',
    },
    'rhzner57': {
      'pt': 'Disciplina: ',
      'en': 'Discipline: ',
      'es': 'Disciplina: ',
    },
    'i5kjnis6': {
      'pt': 'Quantidade da tarefa',
      'en': 'Task quantity',
      'es': 'Cantidad de tareas',
    },
    'm0eam955': {
      'pt': 'Qtd da tarefa: ',
      'en': 'Task quantity: ',
      'es': 'Cantidad de tareas: ',
    },
    'n8zrgq28': {
      'pt': ' ',
      'en': '',
      'es': '',
    },
    'im9khuy2': {
      'pt': 'Quantidade da tarefa',
      'en': 'Task quantity',
      'es': 'Cantidad de tareas',
    },
    'woff5s4d': {
      'pt': 'Qtd executada: ',
      'en': 'Quantity executed: ',
      'es': 'Cantidad ejecutada: ',
    },
    'fw9edepr': {
      'pt': ' ',
      'en': '',
      'es': '',
    },
    'foe0cn9s': {
      'pt': 'Quantidade da tarefa',
      'en': 'Task quantity',
      'es': 'Cantidad de tareas',
    },
    'm8codpph': {
      'pt': 'Campo ',
      'en': 'Field ',
      'es': 'Campo ',
    },
    'm59h86zi': {
      'pt': 'Subcampo 01 - ',
      'en': 'Subfield 01 -',
      'es': 'Subcampo 01 -',
    },
    '53r9xzu8': {
      'pt': 'Seção ',
      'en': 'Section ',
      'es': 'Sección ',
    },
    'p4pd2tlv': {
      'pt': 'Subcampo 01 - ',
      'en': 'Subfield 01 -',
      'es': 'Subcampo 01 -',
    },
    'r4u63g0o': {
      'pt': 'Fileira ',
      'en': 'Row ',
      'es': 'Fila ',
    },
    'sj82fb86': {
      'pt': 'Subcampo 01 - ',
      'en': 'Subfield 01 -',
      'es': 'Subcampo 01 -',
    },
    'u94rtbt6': {
      'pt': 'Tracker ',
      'en': 'Tracker ',
      'es': 'Rastreador ',
    },
    '1iyjlyru': {
      'pt': 'Subcampo 01 - ',
      'en': 'Subfield 01 -',
      'es': 'Subcampo 01 -',
    },
    'lpa5ckk6': {
      'pt': 'Estaca ',
      'en': 'Stake ',
      'es': 'Apostar ',
    },
    'c0bfwcas': {
      'pt': 'Subcampo 01 - ',
      'en': 'Subfield 01 -',
      'es': 'Subcampo 01 -',
    },
    'u0nakc5r': {
      'pt': '  - ',
      'en': ' - ',
      'es': ' - ',
    },
    '1khpelw2': {
      'pt':
          'Título da Tarefa - Breve descrição em poucas linhas sobre o que é essa tarefa',
      'en':
          'Task Title - Brief description in a few lines of what this task is.',
      'es':
          'Título de la tarea: Breve descripción en pocas líneas de lo que es esta tarea.',
    },
    'howjsi0z': {
      'pt': 'Disciplina: ',
      'en': 'Discipline: ',
      'es': 'Disciplina: ',
    },
    '804ytnzi': {
      'pt': 'Quantidade da tarefa',
      'en': 'Task quantity',
      'es': 'Cantidad de tareas',
    },
    '37890zra': {
      'pt': 'Qtd da tarefa: ',
      'en': 'Task quantity: ',
      'es': 'Cantidad de tareas: ',
    },
    '7fez8gdm': {
      'pt': ' ',
      'en': ' ',
      'es': ' ',
    },
    'hh5m18ts': {
      'pt': 'Quantidade da tarefa',
      'en': 'Task quantity',
      'es': 'Cantidad de tareas',
    },
    'idvumjip': {
      'pt': 'Campo ',
      'en': 'Field ',
      'es': 'Campo ',
    },
    'ntdrsqt0': {
      'pt': 'Subcampo 01 - ',
      'en': 'Subfield 01 -',
      'es': 'Subcampo 01 -',
    },
    'p9h7x3v1': {
      'pt': 'Seção ',
      'en': 'Section ',
      'es': 'Sección ',
    },
    '3ixpytnl': {
      'pt': 'Subcampo 01 - ',
      'en': 'Subfield 01 -',
      'es': 'Subcampo 01 -',
    },
    '69mstp46': {
      'pt': 'Fileira ',
      'en': 'Row ',
      'es': 'Fila ',
    },
    'pwc7c0hc': {
      'pt': 'Subcampo 01 - ',
      'en': 'Subfield 01 -',
      'es': 'Subcampo 01 -',
    },
    'y6zcfl8f': {
      'pt': 'Tracker ',
      'en': 'Tracker ',
      'es': 'Rastreador ',
    },
    'oq5xvipm': {
      'pt': 'Subcampo 01 - ',
      'en': 'Subfield 01 -',
      'es': 'Subcampo 01 -',
    },
    'mx9z7190': {
      'pt': 'Estaca ',
      'en': 'Stake ',
      'es': 'Apostar ',
    },
    'rioiwqv2': {
      'pt': 'Subcampo 01 - ',
      'en': 'Subfield 01 -',
      'es': 'Subcampo 01 -',
    },
    'euravd3h': {
      'pt': 'Ver mais',
      'en': 'See more',
      'es': 'Ver más',
    },
    'esu4od55': {
      'pt': 'Inspeções',
      'en': 'Inspections',
      'es': 'Inspecciones',
    },
    'ccsg2rxk': {
      'pt': ' - ',
      'en': '-',
      'es': '-',
    },
    'vx9ivlak': {
      'pt':
          'Título da Tarefa - Breve descrição em poucas linhas sobre o que é essa tarefa',
      'en':
          'Task Title - Brief description in a few lines of what this task is.',
      'es':
          'Título de la tarea: Breve descripción en pocas líneas de lo que es esta tarea.',
    },
    'atxq1cy5': {
      'pt': 'Campo ',
      'en': 'Field',
      'es': 'Campo',
    },
    'akmgfyx2': {
      'pt': 'Subcampo 01 - ',
      'en': 'Subfield 01 -',
      'es': 'Subcampo 01 -',
    },
    '8bui9pwo': {
      'pt': 'Seção ',
      'en': 'Section',
      'es': 'Sección',
    },
    'vrrhul29': {
      'pt': 'Subcampo 01 - ',
      'en': 'Subfield 01 -',
      'es': 'Subcampo 01 -',
    },
    'si5l0i1o': {
      'pt': 'Fileira ',
      'en': 'Row',
      'es': 'Fila',
    },
    'ip0jpvc0': {
      'pt': 'Subcampo 01 - ',
      'en': 'Subfield 01 -',
      'es': 'Subcampo 01 -',
    },
    'tp3pch07': {
      'pt': 'Tracker ',
      'en': 'Tracker',
      'es': 'Rastreador',
    },
    'c85izgp8': {
      'pt': 'Subcampo 01 - ',
      'en': 'Subfield 01 -',
      'es': 'Subcampo 01 -',
    },
    'c6m50hiv': {
      'pt': 'Estaca ',
      'en': 'Stake',
      'es': 'Apostar',
    },
    'egsclmva': {
      'pt': 'Subcampo 01 - ',
      'en': 'Subfield 01 -',
      'es': 'Subcampo 01 -',
    },
    '50jptsec': {
      'pt': 'Disciplina: ',
      'en': 'Discipline: ',
      'es': 'Disciplina: ',
    },
    'bjdlfc6s': {
      'pt': 'Quantidade da tarefa',
      'en': 'Task quantity',
      'es': 'Cantidad de tareas',
    },
    'molmv2zx': {
      'pt': 'Qtd da tarefa: ',
      'en': 'Task quantity:',
      'es': 'Cantidad de tareas:',
    },
    'dhmhzrhr': {
      'pt': ' ',
      'en': '',
      'es': '',
    },
    '46ucbe3w': {
      'pt': 'Quantidade da tarefa',
      'en': 'Task quantity',
      'es': 'Cantidad de tareas',
    },
    'ra4xc42o': {
      'pt': 'Qtd executada: ',
      'en': 'Quantity executed: ',
      'es': 'Cantidad ejecutada: ',
    },
    '0a6bjk1z': {
      'pt': ' ',
      'en': ' ',
      'es': ' ',
    },
    'w7egj0iv': {
      'pt': 'Quantidade da tarefa',
      'en': 'Task quantity',
      'es': 'Cantidad de tareas',
    },
    'vjz5o8ef': {
      'pt': 'Campo ',
      'en': 'Field ',
      'es': 'Campo ',
    },
    'rg17rjk5': {
      'pt': 'Subcampo 01 - ',
      'en': 'Subfield 01 -',
      'es': 'Subcampo 01 -',
    },
    'yrhckpwz': {
      'pt': 'Seção ',
      'en': 'Section ',
      'es': 'Sección ',
    },
    '3p2zt2ex': {
      'pt': 'Subcampo 01 - ',
      'en': 'Subfield 01 -',
      'es': 'Subcampo 01 -',
    },
    'rwuj2ixf': {
      'pt': 'Fileira ',
      'en': 'Row ',
      'es': 'Fila ',
    },
    'a0giccvc': {
      'pt': 'Subcampo 01 - ',
      'en': 'Subfield 01 -',
      'es': 'Subcampo 01 -',
    },
    '79sazoue': {
      'pt': 'Tracker ',
      'en': 'Tracker ',
      'es': 'Rastreador   ',
    },
    '0jqc5azi': {
      'pt': 'Subcampo 01 - ',
      'en': 'Subfield 01 -',
      'es': 'Subcampo 01 -',
    },
    'b4t7f45d': {
      'pt': 'Estaca ',
      'en': 'Stake ',
      'es': 'Apostar ',
    },
    'fkhawdyt': {
      'pt': 'Subcampo 01 - ',
      'en': 'Subfield 01 -',
      'es': 'Subcampo 01 -',
    },
    'jbltf1jo': {
      'pt': 'Ver mais',
      'en': 'See more',
      'es': 'Ver más',
    },
    'vdzgy00m': {
      'pt': 'Concluir tarefas selecionadas',
      'en': 'Complete selected tasks',
      'es': 'Completar tareas seleccionadas',
    },
    'sqrjnpce': {
      'pt': 'Finalizar Inspeções',
      'en': 'Finalize Inspections',
      'es': 'Finalizar inspecciones',
    },
    'ucytgbzo': {
      'pt': 'Olá',
      'en': 'Hello',
      'es': 'Hola',
    },
    'jwhugfqw': {
      'pt': 'Cancelar',
      'en': 'Cancel',
      'es': 'Cancelar',
    },
    'lbwxfqz6': {
      'pt': 'Selecione o idioma',
      'en': 'Select language',
      'es': 'Seleccionar idioma',
    },
    'trz8du0v': {
      'pt': 'Search...',
      'en': 'Search...',
      'es': 'Buscar...',
    },
    '0i8ie65w': {
      'pt': 'Português',
      'en': 'Portuguese',
      'es': 'Portugués',
    },
    'z3bo9i64': {
      'pt': 'English',
      'en': 'English',
      'es': 'Inglés',
    },
    'cx8h5su3': {
      'pt': 'Español',
      'en': 'Spanish',
      'es': 'Español',
    },
    '9o2xk50s': {
      'pt': 'Home',
      'en': 'Home',
      'es': 'Hogar',
    },
  },
  // RDO
  {
    'tc25ehns': {
      'pt': 'Sprint atual',
      'en': 'Current sprint',
      'es': 'Sprint actual',
    },
    'c45lyl99': {
      'pt': 'Diárias',
      'en': 'Daily allowances',
      'es': 'Asignaciones diarias',
    },
    'mn16n2hv': {
      'pt': 'Tarefas da sprint',
      'en': 'Sprint tasks',
      'es': 'Tareas de sprint',
    },
    'ehdjy6wc': {
      'pt': 'Tarefas concluidas',
      'en': 'Tasks completed',
      'es': 'Tareas completadas',
    },
    'tstuiouy': {
      'pt': ' \n',
      'en': '',
      'es': '',
    },
    'qk7yyogd': {
      'pt':
          'Título da Tarefa - Breve descrição em poucas linhas sobre o que é essa tarefa',
      'en':
          'Task Title - Brief description in a few lines of what this task is.',
      'es':
          'Título de la tarea: Breve descripción en pocas líneas de lo que es esta tarea.',
    },
    '5a3s9ama': {
      'pt': 'Campo ',
      'en': 'Field ',
      'es': 'Campo ',
    },
    '598me1p4': {
      'pt': 'Subcampo 01 - ',
      'en': 'Subfield 01 -',
      'es': 'Subcampo 01 -',
    },
    'dt77v4xh': {
      'pt': 'Seção ',
      'en': 'Section ',
      'es': 'Sección ',
    },
    'unmjh970': {
      'pt': 'Subcampo 01 - ',
      'en': 'Subfield 01 -',
      'es': 'Subcampo 01 -',
    },
    'sbxxv64b': {
      'pt': 'Fileira ',
      'en': 'Row ',
      'es': 'Fila ',
    },
    '3goqo52g': {
      'pt': 'Subcampo 01 - ',
      'en': 'Subfield 01 -',
      'es': 'Subcampo 01 -',
    },
    'kooggavg': {
      'pt': 'Tracker ',
      'en': 'Tracker ',
      'es': 'Rastreador ',
    },
    '2oesgw39': {
      'pt': 'Subcampo 01 - ',
      'en': 'Subfield 01 -',
      'es': 'Subcampo 01 -',
    },
    'it9k9s5t': {
      'pt': 'Estacas ',
      'en': 'Stakes ',
      'es': 'Estacas ',
    },
    '3gqb14d0': {
      'pt': 'Subcampo 01 - ',
      'en': 'Subfield 01 -',
      'es': 'Subcampo 01 -',
    },
    'tpuiip3t': {
      'pt': 'Tarefa concluída',
      'en': 'Task completed',
      'es': 'Tarea completada',
    },
    'p4kwjapd': {
      'pt': ' \n',
      'en': '',
      'es': '',
    },
    'fhiur3fr': {
      'pt':
          'Título da Tarefa - Breve descrição em poucas linhas sobre o que é essa tarefa',
      'en':
          'Task Title - Brief description in a few lines of what this task is.',
      'es':
          'Título de la tarea: Breve descripción en pocas líneas de lo que es esta tarea.',
    },
    'gzn4yamy': {
      'pt': 'Campo ',
      'en': 'Field',
      'es': 'Campo',
    },
    'unthw98m': {
      'pt': 'Subcampo 01 - ',
      'en': 'Subfield 01 -',
      'es': 'Subcampo 01 -',
    },
    'jg0intuu': {
      'pt': 'Seção ',
      'en': 'Section',
      'es': 'Sección',
    },
    'pt694c1r': {
      'pt': 'Subcampo 01 - ',
      'en': 'Subfield 01 -',
      'es': 'Subcampo 01 -',
    },
    '3jsok6x0': {
      'pt': 'Fileira ',
      'en': 'Row',
      'es': 'Fila',
    },
    '8te8gplw': {
      'pt': 'Subcampo 01 - ',
      'en': 'Subfield 01 -',
      'es': 'Subcampo 01 -',
    },
    'm9822d8k': {
      'pt': 'Tracker ',
      'en': 'Tracker',
      'es': 'Rastreador',
    },
    '7pvh2u8v': {
      'pt': 'Subcampo 01 - ',
      'en': 'Subfield 01 -',
      'es': 'Subcampo 01 -',
    },
    '2n4eoufd': {
      'pt': 'Estacas ',
      'en': 'Stakes',
      'es': 'Estacas',
    },
    'c8lso4xs': {
      'pt': 'Subcampo 01 - ',
      'en': 'Subfield 01 -',
      'es': 'Subcampo 01 -',
    },
    'opccof5a': {
      'pt': 'Tarefa concluída',
      'en': 'Task completed',
      'es': 'Tarea completada',
    },
    'fsj0u288': {
      'pt': 'Ver mais',
      'en': 'See more',
      'es': 'Ver más',
    },
    'j0hup99e': {
      'pt': 'Finalizar dia de serviço',
      'en': 'End of work day',
      'es': 'Fin de la jornada laboral',
    },
    '3pwm6t3f': {
      'pt': 'Relatório diário de obras',
      'en': 'Daily work report',
      'es': 'Informe diario de trabajo',
    },
    '10uyacrl': {
      'pt': 'Home',
      'en': 'Home',
      'es': 'Hogar',
    },
  },
  // Escala
  {
    'escala_page_title': {
      'pt': 'Escala',
      'en': 'Schedule',
      'es': 'Escala',
    },
    'qbcn9pb2': {
      'pt': 'Procurar por nome do funcionario',
      'en': 'Search by employee name',
      'es': 'Buscar por nombre de empleado',
    },
    'bz6r8act': {
      'pt': 'Selecionados para a escala',
      'en': 'Selected for the scale',
      'es': 'Seleccionado para la escala',
    },
    'x0n39t43': {
      'pt': 'Ver mais',
      'en': 'See more',
      'es': 'Ver más',
    },
    'jpsimc69': {
      'pt': 'Atualizar escala',
      'en': 'Update schedule',
      'es': 'Actualizar el calendario',
    },
    'nm5v3yl8': {
      'pt': 'Selecione um colaborador',
      'en': 'Select a collaborator.',
      'es': 'Seleccione un colaborador.',
    },
    'gm0fjm1z': {
      'pt': 'É preciso selecionar um ou mais colaboradore(s).',
      'en': 'It is necessary to select one or more collaborator(s).',
      'es': 'Es necesario seleccionar uno o más colaboradores.',
    },
    '0faydghs': {
      'pt': 'Erro',
      'en': 'Error',
      'es': 'Error',
    },
    'yj5ftx57': {
      'pt': 'Escala atualizado com sucesso.',
      'en': 'Scale updated successfully.',
      'es': 'Escala actualizada exitosamente.',
    },
    '123inotv': {
      'pt': 'Home',
      'en': 'Home',
      'es': 'Hogar',
    },
  },
  // RDO-2
  {
    'm0f3eq93': {
      'pt': 'Detalhes do relatório diário de obras',
      'en': 'Details of the daily work report',
      'es': 'Detalles del informe diario de trabajo',
    },
    'owk3b8ng': {
      'pt': 'Imagens da obra',
      'en': 'Images of the work',
      'es': 'Imágenes de la obra',
    },
    '3zwh7xox': {
      'pt': 'Tarefas concluídas',
      'en': 'Tasks completed',
      'es': 'Tareas completadas',
    },
    'sszd6ju5': {
      'pt': '\n',
      'en': '',
      'es': '',
    },
    'cq6632yn': {
      'pt':
          'Título da Tarefa - Breve descrição em poucas linhas sobre o que é essa tarefa',
      'en':
          'Task Title - Brief description in a few lines of what this task is.',
      'es':
          'Título de la tarea: Breve descripción en pocas líneas de lo que es esta tarea.',
    },
    'lpdd6c9f': {
      'pt': 'Campo ',
      'en': 'Field ',
      'es': 'Campo ',
    },
    '0olpy7a4': {
      'pt': 'Subcampo 01 - ',
      'en': 'Subfield 01 -',
      'es': 'Subcampo 01 -',
    },
    'p8b1b15o': {
      'pt': 'Seção ',
      'en': 'Section ',
      'es': 'Sección ',
    },
    'oiajy6yz': {
      'pt': 'Subcampo 01 - ',
      'en': 'Subfield 01 -',
      'es': 'Subcampo 01 -',
    },
    '0fheqycn': {
      'pt': 'Fileira ',
      'en': 'Row ',
      'es': 'Fila ',
    },
    's74tgsy0': {
      'pt': 'Subcampo 01 - ',
      'en': 'Subfield 01 -',
      'es': 'Subcampo 01 -',
    },
    '1wfetz3y': {
      'pt': 'Tracker ',
      'en': 'Tracker ',
      'es': 'Rastreador ',
    },
    'rgy4iqjc': {
      'pt': 'Subcampo 01 - ',
      'en': 'Subfield 01 -',
      'es': 'Subcampo 01 -',
    },
    'qxd67311': {
      'pt': 'Estaca ',
      'en': 'Stake ',
      'es': 'Apostar ',
    },
    'u5dqa76e': {
      'pt': 'Subcampo 01 - ',
      'en': 'Subfield 01 -',
      'es': 'Subcampo 01 -',
    },
    '0ye0crjo': {
      'pt': 'Tarefa concluída',
      'en': 'Task completed',
      'es': 'Tarea completada',
    },
    '4umzio73': {
      'pt': 'Escala do dia',
      'en': 'Schedule of the day',
      'es': 'Horario del día',
    },
    '126ifaju': {
      'pt': 'Home',
      'en': 'Home',
      'es': 'Hogar',
    },
  },
  // esqueciSenha
  {
    'xnuekroh': {
      'pt': 'Esqueci senha',
      'en': 'I forgot my password.',
      'es': 'Olvidé mi contraseña.',
    },
    'gytcy3jx': {
      'pt': 'Informe seu email de login.',
      'en': 'Please enter your login email address.',
      'es': 'Ingrese su dirección de correo electrónico de inicio de sesión.',
    },
    's5yvczat': {
      'pt': 'Email',
      'en': 'E-mail',
      'es': 'Correo electrónico',
    },
    'rpojr3im': {
      'pt': 'Você receberá um código via email, informe o código em seguida',
      'en': 'You will receive a code via email; please enter the code below.',
      'es':
          'Recibirás un código por correo electrónico; ingresa el código a continuación.',
    },
    'hit2ngky': {
      'pt': 'Enviar o código',
      'en': 'Send the code',
      'es': 'Envía el código',
    },
    'om59rkuc': {
      'pt': 'Erro',
      'en': 'Error',
      'es': 'Error',
    },
    'ojmpv6wr': {
      'pt': 'Esqueci senha',
      'en': 'I forgot my password.',
      'es': 'Olvidé mi contraseña.',
    },
    'lohbn3al': {
      'pt': 'Clique em confirmar código para redefinir sua senha',
      'en': 'Click on confirm code to reset your password.',
      'es':
          'Haga clic en el código de confirmación para restablecer su contraseña.',
    },
    'k6ppxbwt': {
      'pt': 'Código',
      'en': 'Code',
      'es': 'Código',
    },
    'ich2mu1s': {
      'pt': 'Confirmar código',
      'en': 'Confirm code',
      'es': 'Confirmar código',
    },
    'j91d936u': {
      'pt': 'Erro',
      'en': 'Error',
      'es': 'Error',
    },
    'uh8braec': {
      'pt': 'Esqueci senha',
      'en': 'I forgot my password.',
      'es': 'Olvidé mi contraseña.',
    },
    'ts4inmys': {
      'pt': 'Preencha todos os dados a baixo para poder acessar a plataforma',
      'en': 'Please fill in all the information below to access the platform.',
      'es':
          'Por favor, rellene toda la información a continuación para acceder a la plataforma.',
    },
    'ima8z136': {
      'pt': 'Nova senha',
      'en': 'New Password',
      'es': 'Nueva contraseña',
    },
    'olo9fxlm': {
      'pt': 'Sua senha está',
      'en': 'Your password is',
      'es': 'Tu contraseña es',
    },
    'qwhscomq': {
      'pt': 'fraca',
      'en': 'weak',
      'es': 'débil',
    },
    'lp43mwjl': {
      'pt': 'média',
      'en': 'average',
      'es': 'promedio',
    },
    'p0bfdbi4': {
      'pt': 'forte',
      'en': 'strong',
      'es': 'fuerte',
    },
    '1ccm5jay': {
      'pt': 'muito forte',
      'en': 'very strong',
      'es': 'acérrimo',
    },
    'u79ykqkj': {
      'pt': 'Confirmar nova senha',
      'en': 'Confirm new password',
      'es': 'Confirmar nueva contraseña',
    },
    'o3etm6yg': {
      'pt': 'As senhas não coincidem.',
      'en': 'The passwords don\'t match.',
      'es': 'Las contraseñas no coinciden.',
    },
    '7akk23c6': {
      'pt': 'Clique em confirmar código para redefinir sua senha',
      'en': 'Click on confirm code to reset your password.',
      'es':
          'Haga clic en el código de confirmación para restablecer su contraseña.',
    },
    'p5krgunc': {
      'pt': 'Confirmar código',
      'en': 'Confirm code',
      'es': 'Confirmar código',
    },
    '8jxz2owm': {
      'pt': 'Erro',
      'en': 'Error',
      'es': 'Error',
    },
    'kqccm94f': {
      'pt': 'Home',
      'en': 'Home',
      'es': 'Hogar',
    },
  },
  // Status
  {
    'mi9n2wb7': {
      'pt': 'Escolha uma opção e selecione quais equipamentos vão ',
      'en': 'Choose an option and select which equipment will be used.',
      'es': 'Elija una opción y seleccione qué equipo se utilizará.',
    },
    '8s0aug3p': {
      'pt': 'atualizar seus status na obra.',
      'en': 'Update your status on the project.',
      'es': 'Actualice su estado en el proyecto.',
    },
    'j79w81gz': {
      'pt':
          'Escolha essa opção para informar quais estacas foram cravadas com sucesso na obra.',
      'en':
          'Choose this option to report which piles were successfully driven into the ground.',
      'es':
          'Seleccione esta opción para informar qué pilotes se colocaron correctamente en el suelo.',
    },
    '5kgmcoft': {
      'pt': 'Atualizar Status da Obra',
      'en': 'Update Project Status',
      'es': 'Actualizar el estado del proyecto',
    },
    'qw71x67v': {
      'pt': 'Status',
      'en': 'Status',
      'es': 'Estado',
    },
  },
  // Status02
  {
    'ynh54t8q': {
      'pt': 'Fileira',
      'en': 'Row',
      'es': 'Fila',
    },
    'yevzo53m': {
      'pt': 'Status Atual',
      'en': 'Current Status',
      'es': 'Estado actual',
    },
    'acb48q96': {
      'pt': 'Status novo',
      'en': 'New status',
      'es': 'Nuevo estatus',
    },
    '6d553ff9': {
      'pt': 'Quantidade de estacas selecionadas',
      'en': 'Number of stakes selected',
      'es': 'Número de apuestas seleccionadas',
    },
    '32lqleyx': {
      'pt': 'Atualizar status da seleção',
      'en': 'Update selection status',
      'es': 'Actualizar el estado de la selección',
    },
    'gb8gr6dn': {
      'pt': 'Erro',
      'en': 'Error',
      'es': 'Error',
    },
    'cypsawbe': {
      'pt': 'Status atualizado com sucesso.',
      'en': 'Status updated successfully.',
      'es': 'Estado actualizado exitosamente.',
    },
    'mhghvvc8': {
      'pt': 'Atualizar status para:',
      'en': 'Update status to:',
      'es': 'Actualizar estado a:',
    },
    '2p0gup2q': {
      'pt': 'Historic',
      'en': 'Historic',
      'es': 'Histórico',
    },
  },
  // DetalhesDaTarefa
  {
    '5rbsguk8': {
      'pt':
          'Lorem Ipsum is simply dummy text of the printing and typesetting industry. \n',
      'en':
          'Lorem Ipsum is simply dummy text of the printing and typesetting industry.',
      'es':
          'Lorem Ipsum es simplemente el texto de relleno de las imprentas y archivos de texto.',
    },
    'evq73iqa': {
      'pt': 'Campo ',
      'en': 'Field',
      'es': 'Campo',
    },
    '2mq6ov33': {
      'pt': 'Subcampo 01 - ',
      'en': 'Subfield 01 -',
      'es': 'Subcampo 01 -',
    },
    'vpccsoey': {
      'pt': 'Seção ',
      'en': 'Section',
      'es': 'Sección',
    },
    '1g7os69w': {
      'pt': 'Subcampo 01 - ',
      'en': 'Subfield 01 -',
      'es': 'Subcampo 01 -',
    },
    'q69hklms': {
      'pt': 'Fileira ',
      'en': 'Row',
      'es': 'Fila',
    },
    '4iuoqndi': {
      'pt': 'Subcampo 01 - ',
      'en': 'Subfield 01 -',
      'es': 'Subcampo 01 -',
    },
    '8uexfrgt': {
      'pt': 'Quantidade de módulos: ',
      'en': 'Number of modules:',
      'es': 'Número de módulos:',
    },
    'wi23haxt': {
      'pt': 'Sequencia de estacas',
      'en': 'Sequence of stakes',
      'es': 'Secuencia de apuestas',
    },
    'od7kmxne': {
      'pt': 'Home',
      'en': 'Home',
      'es': 'Hogar',
    },
  },
  // Page_check_qrcode
  {
    'qr4xddtf': {
      'pt': 'Log out',
      'en': 'Log out',
      'es': 'Finalizar la sesión',
    },
    'qqc2xga2': {
      'pt': 'Escala do dia',
      'en': 'Schedule of the day',
      'es': 'Horario del día',
    },
    'i88fnbil': {
      'pt':
          'Para iniciar sua jornada de trabalho, você percisa realizar as leituras de QR Code necessárias.',
      'en': 'To begin your workday, you need to scan the required QR codes.',
      'es':
          'Para comenzar su jornada laboral, debe escanear los códigos QR requeridos.',
    },
    '7lryoor6': {
      'pt': 'Leituras necessárias',
      'en': 'Required readings',
      'es': 'Lecturas obligatorias',
    },
    'e4vvk2uy': {
      'pt': 'Leituras QRCode realizadas',
      'en': 'QR Code readings performed',
      'es': 'Lecturas de códigos QR realizadas',
    },
    'otvmw9eb': {
      'pt': 'Leitura manualmente realizadas',
      'en': 'Manually performed readings',
      'es': 'Lecturas realizadas manualmente',
    },
    'nj8aj8uo': {
      'pt': 'Liberar por QR Code',
      'en': 'Release via QR Code',
      'es': 'Lanzamiento mediante código QR',
    },
    '62w4l0pi': {
      'pt': 'Erro',
      'en': 'Error',
      'es': 'Error',
    },
    'hf8ujqxe': {
      'pt': 'QR Code do funcionário lido com sucesso.',
      'en': 'Employee QR code successfully read.',
      'es': 'Código QR del empleado leído correctamente.',
    },
    'bpct43vm': {
      'pt': 'Cancelar',
      'en': 'Cancel',
      'es': 'Cancelar',
    },
    '2hrptyy4': {
      'pt': 'Liberar manualmente',
      'en': 'Release manually',
      'es': 'Liberar manualmente',
    },
    'sefof8ig': {
      'pt': 'Começar jornada de trabalho',
      'en': 'Start the workday',
      'es': 'Comienza la jornada laboral',
    },
    'z0y0nc0v': {
      'pt': 'Erro',
      'en': 'Error',
      'es': 'Error',
    },
    'mwi5drd0': {
      'pt': 'Home',
      'en': 'Home',
      'es': 'Hogar',
    },
  },
  // filter-campo
  {
    'o4xdavj2': {
      'pt': 'Filtrar por campo',
      'en': 'Filter by field',
      'es': 'Filtrar por campo',
    },
    'saoaaaxc': {
      'pt': 'Filtrar',
      'en': 'Filter',
      'es': 'Filtrar',
    },
    'rasg4snz': {
      'pt': 'Selecione um campo',
      'en': 'Select a field',
      'es': 'Seleccione un campo',
    },
  },
  // filter-secao
  {
    'lxwooal5': {
      'pt': 'Filtrar por seção',
      'en': 'Filter by section',
      'es': 'Filtrar por sección',
    },
    'irq0erjr': {
      'pt': 'Filtrar',
      'en': 'Filter',
      'es': 'Filtrar',
    },
    'ut0sse3x': {
      'pt': 'Selecione uma seção',
      'en': 'Select a section',
      'es': 'Seleccione una sección',
    },
  },
  // filter-fileira
  {
    'cuy43o7s': {
      'pt': 'Filtar por fileira',
      'en': 'Filter by row',
      'es': 'Filtrar por fila',
    },
    'swglfx96': {
      'pt': 'Filtrar',
      'en': 'Filter',
      'es': 'Filtrar',
    },
    'djngw56d': {
      'pt': 'Selecione uma fileira',
      'en': 'Select a row',
      'es': 'Seleccione una fila',
    },
  },
  // filter-tracker
  {
    '1ulhb102': {
      'pt': 'Filtar por tracker',
      'en': 'Filter by tracker',
      'es': 'Filtrar por rastreador',
    },
    'cqaw801i': {
      'pt': 'Filtrar',
      'en': 'Filter',
      'es': 'Filtrar',
    },
    '29x11ei4': {
      'pt': 'Selecione uma seção',
      'en': 'Select a section',
      'es': 'Seleccione una sección',
    },
  },
  // Imagens
  {
    'ebebloke': {
      'pt': 'Galeria de fotos',
      'en': 'Photo gallery',
      'es': 'Galería de fotos',
    },
    'c9xelgdm': {
      'pt': 'Veja as fotos registradas nesse dia da obra.',
      'en': 'See the photos taken on that day of the construction.',
      'es': 'Vea las fotos tomadas ese día de la construcción.',
    },
  },
  // Logout
  {
    'zvzp1hao': {
      'pt': 'Logout',
      'en': 'Logout',
      'es': 'Cerrar sesión',
    },
  },
  // confirmdialog
  {
    'haubphh0': {
      'pt': 'Todas as tarefas foram executadas com sucesso?',
      'en': 'Were all tasks completed successfully?',
      'es': '¿Se completaron exitosamente todas las tareas?',
    },
    'b1ti6dz5': {
      'pt':
          'Se todas foram concluídas com sucesso, clique em \'Sim\'. Se alguma tarefa tiver falhado, clique em \'Não\'.',
      'en':
          'If all tasks were completed successfully, click \'Yes\'. If any task failed, click \'No\'.',
      'es':
          'Si todas las tareas se completaron correctamente, haga clic en «Sí». Si alguna tarea falló, haga clic en «No».',
    },
    '1b0xc4lv': {
      'pt': 'Sim',
      'en': 'Yes',
      'es': 'Sí',
    },
    'apatljfn': {
      'pt': 'Erro',
      'en': 'Error',
      'es': 'Error',
    },
    'kqv63umr': {
      'pt': 'Não',
      'en': 'No',
      'es': 'No',
    },
    'sg67i0zz': {
      'pt': 'Identifique as tarefas com falha e explique o problema.',
      'en': 'Identify the tasks that failed and explain the problem.',
      'es': 'Identifique las tareas que fallaron y explique el problema.',
    },
    '8tcm52tq': {
      'pt':
          'Por favor, selecione as tarefas que não foram concluídas com sucesso e insira um breve comentário sobre a causa do defeito.',
      'en':
          'Please select the tasks that were not completed successfully and provide a brief comment about the cause of the problem.',
      'es':
          'Seleccione las tareas que no se completaron exitosamente y proporcione un breve comentario sobre la causa del problema.',
    },
    'wcowp62x': {
      'pt': 'Tarefas selecionadas ',
      'en': 'Selected tasks ',
      'es': 'Tareas seleccionadas ',
    },
    '50k8pisk': {
      'pt': 'Hello World',
      'en': 'Hello World',
      'es': 'Hola Mundo',
    },
    'a56c8i52': {
      'pt': 'Proximo',
      'en': 'Next',
      'es': 'Próximo',
    },
    'nmckbejo': {
      'pt': 'Atenção',
      'en': 'Attention',
      'es': 'Atención',
    },
    'c5tvkxa6': {
      'pt': 'Selecione as tarefas sem sucesso para prosseguir.',
      'en': 'Select the unsuccessful tasks to proceed.',
      'es': 'Seleccione las tareas fallidas para continuar.',
    },
    'zmuwf7qv': {
      'pt': 'Voltar',
      'en': 'To go back',
      'es': 'Para volver atrás',
    },
    'zpnho10m': {
      'pt': 'Status ',
      'en': 'Status',
      'es': 'Estado',
    },
    '7iku26rr': {
      'pt':
          'Escolha o status de falha da tarefa. As tarefas que não forem selecionadas receberão automaticamente o status não selecionado sendo \"',
      'en':
          'Choose the task failure status. Tasks that are not selected will automatically receive the status \"not selected\".',
      'es':
          'Seleccione el estado de error de la tarea. Las tareas no seleccionadas recibirán automáticamente el estado \"no seleccionadas\".',
    },
    'w32q5hxy': {
      'pt': 'Sem sucesso, sem impedimento',
      'en': 'Without success, without impediment.',
      'es': 'Sin éxito, sin impedimentos.',
    },
    'jvqcbyev': {
      'pt': ' ou ',
      'en': 'or',
      'es': 'o',
    },
    't05u5a58': {
      'pt': 'Sem sucesso, com impedimento',
      'en': 'Unsuccessful, with impediment',
      'es': 'Sin éxito, con impedimento',
    },
    '5rc9klky': {
      'pt': '\".',
      'en': '\".',
      'es': '\".',
    },
    'fs2sjdcl': {
      'pt':
          'Escolha o status de falha da tarefa. As tarefas que não forem selecionadas receberão automaticamente o status não selecionado sendo \"Sem sucesso, sem impedimento ou Sem sucesso, com impedimento\".',
      'en':
          'Choose the task failure status. Tasks that are not selected will automatically receive the unselected status, either \"Unsuccessful, no impediment\" or \"Unsuccessful, with impediment\".',
      'es':
          'Seleccione el estado de fallo de la tarea. Las tareas no seleccionadas recibirán automáticamente el estado de no seleccionadas, ya sea \"Fracasada, sin impedimento\" o \"Fracasada, con impedimento\".',
    },
    '44ryozxd': {
      'pt': 'Selecione o status da tarefa',
      'en': 'Select the task status.',
      'es': 'Seleccione el estado de la tarea.',
    },
    'kaaujiwr': {
      'pt': 'Search...',
      'en': 'Search...',
      'es': 'Buscar...',
    },
    '0vhawvnj': {
      'pt': 'Sem sucesso, com impedimento',
      'en': 'Unsuccessful, with impediment',
      'es': 'Sin éxito, con impedimento',
    },
    'v0q9vcht': {
      'pt': 'Sem sucesso, sem impedimento',
      'en': 'Without success, without impediment.',
      'es': 'Sin éxito, sin impedimentos.',
    },
    '5rpm6l4n': {
      'pt': 'Com sucesso',
      'en': 'Successfully',
      'es': 'Exitosamente',
    },
    'gitypcyz': {
      'pt': 'Selecione o status da tarefa',
      'en': 'Select the task status.',
      'es': 'Seleccione el estado de la tarea.',
    },
    '1bm1fbeq': {
      'pt': 'COD: ',
      'en': 'COD: ',
      'es': 'COD: ',
    },
    'osm9t2ao': {
      'pt': ' - ',
      'en': ' - ',
      'es': ' - ',
    },
    '70e2y7hl': {
      'pt': 'Hello World',
      'en': 'Hello World',
      'es': 'Hola Mundo',
    },
    'w6z4j997': {
      'pt': 'Finalizar',
      'en': 'Finish',
      'es': 'Finalizar',
    },
    '9va460z9': {
      'pt': 'Erro',
      'en': 'Error',
      'es': 'Error',
    },
    'ixhzuegl': {
      'pt': 'Tarefas sem status',
      'en': 'Tasks with no status',
      'es': 'Tareas sin estado',
    },
    'i38360nm': {
      'pt': 'Existem tarefas que ainda não possuem um status definido.',
      'en': 'There are tasks that do not yet have a defined status.',
      'es': 'Hay tareas que aún no tienen un estado definido.',
    },
    'guhgheah': {
      'pt': 'Voltar',
      'en': 'To go back',
      'es': 'Para volver atrás',
    },
  },
  // confirmdialogRDO
  {
    '7x2b7c3z': {
      'pt': 'Finalizar dia de serviço!',
      'en': 'End of the workday!',
      'es': '¡Fin de la jornada laboral!',
    },
    '61j1tqp6': {
      'pt':
          'Ótimo trabalho hoje. Para finalizar, por favor anexe pelo menos três fotos registrando o seu dia de trabalho:',
      'en':
          'Great work today. To wrap up, please attach at least three photos documenting your workday:',
      'es':
          '¡Buen trabajo hoy! Para finalizar, adjunte al menos tres fotos que documenten su jornada laboral:',
    },
    'bfztiwah': {
      'pt': 'Finalizar RDO',
      'en': 'Finalize RDO',
      'es': 'Finalizar RDO',
    },
    'u4tn1dll': {
      'pt': 'Quantidade Mínima de Imagens Requeridas ',
      'en': 'Minimum Number of Images Required ',
      'es': 'Número mínimo de imágenes requeridas ',
    },
    'ep7kksyg': {
      'pt': 'O número mínimo de imagens solicitadas é três',
      'en': 'The minimum number of images requested is three.',
      'es': 'El número mínimo de imágenes solicitadas es tres.',
    },
  },
  // modal_info
  {
    '6m5ttdns': {
      'pt': 'OK',
      'en': 'OK',
      'es': 'DE ACUERDO',
    },
  },
  // empty
  {
    '8w9u36pg': {
      'pt': 'Vazio',
      'en': 'Empty',
      'es': 'Vacío',
    },
  },
  // modal_sprints_filtro
  {
    'pzb8y9q2': {
      'pt': 'Filtre por sprints',
      'en': 'Filter by sprints',
      'es': 'Filtrar por sprints',
    },
    'r0k0lwsl': {
      'pt':
          'Filtre por data e depois seleciona a sprint que você quer consultar.',
      'en': 'Filter by date and then select the sprint you want to view.',
      'es': 'Filtra por fecha y luego selecciona el sprint que deseas ver.',
    },
    '0w4u62um': {
      'pt': 'Selecione um período de datas',
      'en': 'Select a date range.',
      'es': 'Seleccione un rango de fechas.',
    },
    'h05kq77r': {
      'pt': 'Ver mais',
      'en': 'See more',
      'es': 'Ver más',
    },
    'rbp40dih': {
      'pt': 'Filtrar',
      'en': 'Filter',
      'es': 'Filtrar',
    },
  },
  // calendar
  {
    'wcz9kw1c': {
      'pt': 'Cancelar',
      'en': 'Cancel',
      'es': 'Cancelar',
    },
    'offline_banner_message': {
      'pt': 'Modo offline ativo. Seus dados serão sincronizados quando a conexão voltar',
      'en': 'Offline mode active. Your data will sync when the connection returns',
      'es': 'Modo sin conexión activo. Sus datos se sincronizarán cuando vuelva la conexión',
    },
    'f2wzrh3a': {
      'pt': 'Ok',
      'en': 'OK',
      'es': 'DE ACUERDO',
    },
  },
  // modal_escala_manual
  {
    'nql6xby5': {
      'pt': 'Escala do dia',
      'en': 'Schedule of the day',
      'es': 'Horario del día',
    },
    'cap78f1h': {
      'pt': 'Procurar por nome do funcionário',
      'en': 'Search by employee name',
      'es': 'Buscar por nombre de empleado',
    },
    'kzhorq1z': {
      'pt': 'Ver mais',
      'en': 'See more',
      'es': 'Ver más',
    },
    'jks9ub5u': {
      'pt': 'Liberar funcionário',
      'en': 'Release employee',
      'es': 'Empleado de liberación',
    },
    'rg9vm2xh': {
      'pt': 'Erro',
      'en': 'Error',
      'es': 'Error',
    },
    '8ss1g5sq': {
      'pt': 'Funcionário liberado manualmente com sucesso.',
      'en': 'Employee successfully released manually.',
      'es': 'Empleado liberado manualmente con éxito.',
    },
    'mlocknv7': {
      'pt': 'Cancelar',
      'en': 'Cancel',
      'es': 'Cancelar',
    },
  },
  // rdo_estacas
  {
    'z7lemnvc': {
      'pt': 'Status da estaca',
      'en': 'Stake status',
      'es': 'Estado de la participación',
    },
    'etvgr6jm': {
      'pt': 'Search...',
      'en': 'Search...',
      'es': 'Buscar...',
    },
    'b12opzd1': {
      'pt': 'Cravada com problema mas sem impeditivo para montagem do tracker',
      'en':
          'The car has a problem, but it doesn\'t prevent the tracker from being installed.',
      'es':
          'El coche tiene un problema, pero no impide instalar el rastreador.',
    },
    'caf2sltj': {
      'pt': 'Problema que impede a montagem do tracker',
      'en': 'Problem preventing tracker assembly.',
      'es': 'Problema que impide el montaje del rastreador.',
    },
  },
  // tasks_sem_sucesso
  {
    'tu8maiei': {
      'pt': 'Selecionar todas tarefas',
      'en': 'Select all tasks',
      'es': 'Seleccionar todas las tareas',
    },
    'zeup5me6': {
      'pt': 'COD: ',
      'en': 'COD: ',
      'es': 'COD: ',
    },
    'n1azztlj': {
      'pt': ' - ',
      'en': ' - ',
      'es': ' - ',
    },
  },
  // row_list_subtasks
  {
    'xx2076lf': {
      'pt': 'Quantidade executada do dia',
      'en': 'Quantity executed for the day',
      'es': 'Cantidad ejecutada en el día',
    },
    'hohczhfj': {
      'pt': 'ex: 10000',
      'en': 'e.g.: 10000',
      'es': 'p. ej.: 10000',
    },
    'sf1akum3': {
      'pt': 'Selecione o check-box para preencher a quantidade.',
      'en': 'Select the checkbox to enter the quantity.',
      'es': 'Seleccione la casilla de verificación para ingresar la cantidad.',
    },
    '3hj2jbb3': {
      'pt': 'Comentários',
      'en': 'Comments',
      'es': 'Comentarios',
    },
    '42ljkfby': {
      'pt': 'Digite o cometário para essa tarefa...',
      'en': 'Type a comment for this task...',
      'es': 'Escriba un comentario para esta tarea...',
    },
    '2fz3x0bl': {
      'pt': 'Selecione o check-box para escrever um comentario.',
      'en': 'Select the checkbox to write a comment.',
      'es':
          'Seleccione la casilla de verificación para escribir un comentario.',
    },
  },
  // comment_insp
  {
    'p8vdi2fm': {
      'pt': 'Status da Inspeção',
      'en': 'Inspection Status',
      'es': 'Estado de la inspección',
    },
    'jgmjtq32': {
      'pt': 'Selecione se a inspeção foi Aprovada ou Reprovada.',
      'en': 'Select whether the inspection was Approved or Failed.',
      'es': 'Seleccione si la inspección fue Aprobada o Fallida.',
    },
    'oir64qfo': {
      'pt': 'Reprovado',
      'en': 'Failed',
      'es': 'Fallido',
    },
    '9q06rsyo': {
      'pt': 'Aprovado',
      'en': 'Approved',
      'es': 'Aprobado',
    },
    '1qq2uysz': {
      'pt': 'Reprovação nas tarefas selecionadas',
      'en': 'Failure in the selected tasks.',
      'es': 'Fracaso en las tareas seleccionadas.',
    },
    'y69hg5nb': {
      'pt':
          'As tarefas selecionadas foram reprovadas. Você pode adicionar um comentário ou finalizar a inspeção.',
      'en':
          'The selected tasks were rejected. You can add a comment or finalize the inspection.',
      'es':
          'Las tareas seleccionadas fueron rechazadas. Puede agregar un comentario o finalizar la inspección.',
    },
    'uuz62wkt': {
      'pt': 'Comentar',
      'en': 'Comment',
      'es': 'Comentario',
    },
    'b350j8ev': {
      'pt': 'Finalizar',
      'en': 'Finish',
      'es': 'Finalizar',
    },
    'k6lzi8xo': {
      'pt': 'Comentários',
      'en': 'Comments',
      'es': 'Comentarios',
    },
    'dm3dq3q7': {
      'pt':
          'Você pode adicionar um comentário para uma tarefa e replicá-lo automaticamente para as demais.',
      'en':
          'You can add a comment to a task and have it automatically replicated to the others.',
      'es':
          'Puedes agregar un comentario a una tarea y hacer que se replique automáticamente en las demás.',
    },
    's3q5mjdd': {
      'pt': '  - ',
      'en': ' - ',
      'es': ' - ',
    },
    'y0rqxch1': {
      'pt':
          'Título da Tarefa - Breve descrição em poucas linhas sobre o que é essa tarefa',
      'en':
          'Task Title - Brief description in a few lines of what this task is.',
      'es':
          'Título de la tarea: Breve descripción en pocas líneas de lo que es esta tarea.',
    },
    '2gcbyrzc': {
      'pt': 'Finalizar',
      'en': 'Finish',
      'es': 'Finalizar',
    },
  },
  // txt_comment_insp
  {
    'kd3hxhke': {
      'pt': 'Comentario da tarefa',
      'en': 'Task commentary',
      'es': 'Comentario de la tarea',
    },
  },
  // Miscellaneous
  {
    '7e69s50e': {
      'pt': '',
      'en': '',
      'es': '',
    },
    'piuih0ju': {
      'pt': '',
      'en': '',
      'es': '',
    },
    'e8vmj7zb': {
      'pt': '',
      'en': '',
      'es': '',
    },
    '90nzvogv': {
      'pt': '',
      'en': '',
      'es': '',
    },
    'bd2b97fq': {
      'pt': '',
      'en': '',
      'es': '',
    },
    'saq95xpn': {
      'pt': '',
      'en': '',
      'es': '',
    },
    'vaxmr8bf': {
      'pt': '',
      'en': '',
      'es': '',
    },
    'xa6cjivl': {
      'pt': '',
      'en': '',
      'es': '',
    },
    '6yc5kh5p': {
      'pt': '',
      'en': '',
      'es': '',
    },
    'o9t5e8qk': {
      'pt': '',
      'en': '',
      'es': '',
    },
    'fdw49i94': {
      'pt': '',
      'en': '',
      'es': '',
    },
    'rtrikrd2': {
      'pt': '',
      'en': '',
      'es': '',
    },
    'bn7cchns': {
      'pt': '',
      'en': '',
      'es': '',
    },
    'kcnhh5ct': {
      'pt': '',
      'en': '',
      'es': '',
    },
    '8lxchlj9': {
      'pt': '',
      'en': '',
      'es': '',
    },
    'mh5qz27d': {
      'pt': '',
      'en': '',
      'es': '',
    },
    'x09o96ia': {
      'pt': '',
      'en': '',
      'es': '',
    },
    'w1xvrqpq': {
      'pt': '',
      'en': '',
      'es': '',
    },
    'j6wp507i': {
      'pt': '',
      'en': '',
      'es': '',
    },
    'bv66wih2': {
      'pt': '',
      'en': '',
      'es': '',
    },
    '12icw4ch': {
      'pt': '',
      'en': '',
      'es': '',
    },
    'a9zrsld6': {
      'pt': '',
      'en': '',
      'es': '',
    },
    'qb2epidi': {
      'pt': '',
      'en': '',
      'es': '',
    },
    'o2cxp0nj': {
      'pt': '',
      'en': '',
      'es': '',
    },
    'y7i2zl99': {
      'pt': '',
      'en': '',
      'es': '',
    },
    '81fs9xfw': {
      'pt': '',
      'en': '',
      'es': '',
    },
    'ye1qr1lh': {
      'pt': '',
      'en': '',
      'es': '',
    },
  },
].reduce((a, b) => a..addAll(b));
