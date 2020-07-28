from distutils.core import setup, Extension
setup(name='nagisa_utils',
      version='1.0',
      ext_modules=[Extension('nagisa_utils', ['nagisa_utils.c'])]
      )
