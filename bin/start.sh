export NODE_PATH=$NODE_PATH:$PWD/server

BOLD='\033[1m'
NORMAL='\033[0m'
RED='\033[0;31m'
BLUE='\033[0;34m'

if [ $# -eq 0 ]; then
  echo -e "--------------- $RED $BOLD Normal restart:  $NORMAL"
  echo -e "--------------- $RED $BOLD Pass -r as first argument or restart for Graceful Restart: $NORMAL"
  export arg1="na"
else
  export arg1=$1
fi


if [ $arg1 == 'restart' ] || [ $arg1 == 'r' ]; then
  export NODE_START='restart'
else
  export NODE_START="na"
fi


while getopts "t" opt; do
  case $opt in
    t) NB_TAIL_LOGS=1;;
  esac
done

if [ ! -d "$PWD/bin" -o ! -d "$PWD/server" ]; then
  echo "Please run the shell script from project's root folder"
  exit
fi
# Indian Time zone
export TZ='Asia/Kolkata'
# Disable the runtime.json thing of config.js. It's annoying and sometimes breaks clustering.
export NODE_CONFIG_DISABLE_FILE_WATCH="Y"

# Setup metalogger
export NODE_LOGGER_LEVEL='notice'
export NODE_LOGGER_GRANULARLEVELS=0
export NODE_LOGGER_PLUGIN='util'

NBS_CURR_PROJECT_PATH=$PWD

if [ ! $NODE_LAUNCH_SCRIPT ]; then
  export NODE_LAUNCH_SCRIPT="$NBS_CURR_PROJECT_PATH/main.js"
fi

if [ ! -f "$NODE_LAUNCH_SCRIPT" ]; then
  echo "Launch script: '$NODE_LAUNCH_SCRIPT' could not be located. Aborting..."
  exit
fi

if [ ! $NODE_ENV ]; then
  export NODE_ENV=production
fi

if [ ! $NODE_CLUSTERED ]; then
  export NODE_CLUSTERED=0
fi

if [ ! $NODE_SERVE_STATIC ]; then
  export NODE_SERVE_STATIC=1
fi

if [ ! $NODE_HOT_RELOAD ]; then
  export NODE_HOT_RELOAD=0
fi


if [ !  $NODE_CONFIG_DIR ]; then
  export NODE_CONFIG_DIR="$NBS_CURR_PROJECT_PATH/config"
fi
if [ ! -d "$NODE_CONFIG_DIR" ]; then
  mkdir $NODE_CONFIG_DIR
fi

if [ ! $NODE_LOG_DIR ]; then
  export NODE_LOG_DIR="$NBS_CURR_PROJECT_PATH/logs"
fi
if [ ! -d "$NODE_LOG_DIR" ]; then
  mkdir $NODE_LOG_DIR
fi

if [ ! -f "$NODE_LOG_DIR/error.log" ]; then
    touch $NODE_LOG_DIR/error.log
fi

if [ ! -f "$NODE_LOG_DIR/warn.log" ]; then
    touch $NODE_LOG_DIR/warn.log
fi

if [ ! -f "$NODE_LOG_DIR/info.log" ]; then
    touch $NODE_LOG_DIR/info.log
fi

if [ ! -f "$NODE_LOG_DIR/info.log" ]; then
    touch $NODE_LOG_DIR/info.log
fi


# Let's make sure you have forever/nodemon installed, if we are gonna need it:
if [ $NODE_HOT_RELOAD -eq 0 ] && [ ! `which pm2` ]; then
    echo "ERROR: Please install pm2 with:";
    echo "  npm install pm2 -g";
    exit 1;
fi

if [ $NODE_HOT_RELOAD -eq 1 ] && [ ! `which nodemon` ]; then
    echo "ERROR: Please install nodemon with:";
    echo "  npm install nodemon -g";
    exit 1;
fi

# Let's make sure you NODE_HOT_RELOAD is set to one of the only two allowed values
if [ ! $NODE_HOT_RELOAD -eq 1 ] && [ ! $NODE_HOT_RELOAD -eq 0 ]; then
    echo "ERROR: The only two valid values for NODE_HOT_RELOAD are '1' and '0'. You are trying to set $NODE_HOT_RELOAD";
    exit 1
fi

# @TODO: not necessarily the best way to stop the process
if [ !$NODE_HOT_RELOAD ]; then
    pm2 stop $NODE_LAUNCH_SCRIPT
fi

# Now that we know there is no old version running, let's start the processes

if [ $NODE_HOT_RELOAD -eq 0 ]; then
  if [ $NODE_START == "restart" ]; then
    echo -e "--------------- $RED $BOLD Graceful Restart: $NORMAL"
    NCMD="pm2 gracefulReload"
    NCMD="$NCMD $NODE_LAUNCH_SCRIPT -i "$(nproc)
  else
    NCMD="pm2 start"
    NCMD="$NCMD $NODE_LAUNCH_SCRIPT -i "$(nproc)
  fi
else
    NCMD="nodemon"
    NCMD="$NCMD $NODE_LAUNCH_SCRIPT"
fi

$NCMD
# $RELOAD

if [ $NODE_HOT_RELOAD -eq 0 ]; then
    echo "--------------- NOTE: --------------"
    echo "You can stop the application by running (in this folder):"
    echo -e "  > $BLUE $BOLD pm2 stop $NODE_LAUNCH_SCRIPT $NORMAL"
    echo "You can see all pm2-running node apps by issuing:"
    echo -e "  > $BLUE $BOLD pm2 list $NORMAL"
    echo "------------------------------------"
fi

if [ $NB_TAIL_LOGS ] && [ $NODE_HOT_RELOAD -eq 0 ]; then
    pm2 logs
fi
