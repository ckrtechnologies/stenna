if(NOT TARGET hermes-engine::hermesvm)
add_library(hermes-engine::hermesvm SHARED IMPORTED)
set_target_properties(hermes-engine::hermesvm PROPERTIES
    IMPORTED_LOCATION "/Users/chandanmallik/.gradle/caches/9.4.1/transforms/b1b7728b66f520ef71bfbc3b90079b60/transformed/hermes-android-260318099.0.4-debug/prefab/modules/hermesvm/libs/android.armeabi-v7a/libhermesvm.so"
    INTERFACE_INCLUDE_DIRECTORIES "/Users/chandanmallik/.gradle/caches/9.4.1/transforms/b1b7728b66f520ef71bfbc3b90079b60/transformed/hermes-android-260318099.0.4-debug/prefab/modules/hermesvm/include"
    INTERFACE_LINK_LIBRARIES ""
)
endif()

