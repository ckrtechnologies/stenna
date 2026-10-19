if(NOT TARGET react-native-worklets::worklets)
add_library(react-native-worklets::worklets SHARED IMPORTED)
set_target_properties(react-native-worklets::worklets PROPERTIES
    IMPORTED_LOCATION "/Users/chandanmallik/projects/stenna/app_salesboy/node_modules/react-native-worklets/android/build/intermediates/cxx/RelWithDebInfo/n1k5oq1k/obj/x86/libworklets.so"
    INTERFACE_INCLUDE_DIRECTORIES "/Users/chandanmallik/projects/stenna/app_salesboy/node_modules/react-native-worklets/android/build/prefab-headers/worklets"
    INTERFACE_LINK_LIBRARIES ""
)
endif()

